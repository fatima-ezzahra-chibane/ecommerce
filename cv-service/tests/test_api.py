import io
import os
import tempfile
import threading
import unittest
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

from PIL import Image, ImageDraw

_tmp = tempfile.mkdtemp()
os.environ["CV_INDEX_PATH"] = str(Path(_tmp) / "index.pkl")

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app, matcher  # noqa: E402


def _png(draw_fn, size=(320, 320), background="white") -> bytes:
    img = Image.new("RGB", size, background)
    draw_fn(ImageDraw.Draw(img), size)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


RED_CIRCLE = _png(lambda d, s: d.ellipse((60, 60, s[0] - 60, s[1] - 60), fill="red"))
BLUE_STRIPES = _png(
    lambda d, s: [d.rectangle((x, 0, x + 20, s[1]), fill="navy") for x in range(0, s[0], 40)],
    background="yellow",
)
GREEN_CHECKER = _png(
    lambda d, s: [
        d.rectangle((x, y, x + 32, y + 32), fill="darkgreen")
        for x in range(0, s[0], 64)
        for y in range(0, s[1], 64)
    ],
    background="black",
)

IMAGES = {"/circle.png": RED_CIRCLE, "/stripes.png": BLUE_STRIPES}


class _ImageHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        data = IMAGES.get(self.path)
        if data is None:
            self.send_response(404)
            self.end_headers()
            return
        self.send_response(200)
        self.send_header("Content-Type", "image/png")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, *args):
        pass


class CvServiceTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = HTTPServer(("127.0.0.1", 0), _ImageHandler)
        cls.base = f"http://127.0.0.1:{cls.server.server_port}"
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()

    def setUp(self):
        self.client.delete("/index")

    def _index(self, product_id, path):
        return self.client.post("/index/url", json={"product_id": product_id, "image_url": self.base + path})

    def _search(self, data):
        return self.client.post("/search", files={"file": ("photo.png", data, "image/png")})

    def test_health_reports_index_size_and_thresholds(self):
        body = self.client.get("/health").json()
        self.assertEqual(body["status"], "ok")
        self.assertEqual(body["indexed_products"], 0)
        self.assertIn("min_similarity", body)

    def test_search_on_empty_index_returns_no_product(self):
        body = self._search(RED_CIRCLE).json()
        self.assertIsNone(body["product_id"])
        self.assertEqual(body["reason"], "empty_index")

    def test_index_then_search_same_image_matches_product(self):
        self.assertEqual(self._index(1, "/circle.png").status_code, 200)
        self.assertEqual(self._index(2, "/stripes.png").status_code, 200)
        self.assertEqual(self.client.get("/health").json()["indexed_products"], 2)

        body = self._search(RED_CIRCLE).json()
        self.assertEqual(body["product_id"], 1)
        self.assertEqual(body["match_count"], 1)
        self.assertGreaterEqual(body["confidence"], matcher.stats()["min_similarity"])

    def test_unrelated_image_is_not_matched(self):
        self._index(1, "/circle.png")
        self._index(2, "/stripes.png")

        body = self._search(GREEN_CHECKER).json()
        self.assertIsNone(body["product_id"])
        self.assertIn(body["reason"], ("below_threshold", "ambiguous"))

    def test_index_unreachable_or_missing_image_returns_422(self):
        self.assertEqual(self._index(3, "/missing.png").status_code, 422)
        self.assertEqual(
            self.client.post("/index/url", json={"product_id": 3, "image_url": "http://127.0.0.1:9/x.png"}).status_code,
            422,
        )

    def test_search_with_invalid_or_empty_file(self):
        self._index(1, "/circle.png")
        self.assertEqual(self._search(b"").status_code, 422)
        self.assertEqual(self._search(b"not an image").json()["reason"], "no_features")

    def test_clear_index_removes_everything(self):
        self._index(1, "/circle.png")
        self.assertEqual(self.client.delete("/index").json(), {"cleared": True})
        self.assertEqual(self.client.get("/health").json()["indexed_products"], 0)

    def test_remove_single_product_from_index(self):
        self._index(1, "/circle.png")
        self._index(2, "/stripes.png")

        self.assertEqual(self.client.delete("/index/1").json(), {"product_id": 1, "removed": True})
        self.assertEqual(self.client.delete("/index/1").json()["removed"], False)
        self.assertEqual(self.client.get("/health").json()["indexed_products"], 1)
        self.assertNotEqual(self._search(RED_CIRCLE).json()["product_id"], 1)

    def test_index_persists_across_matcher_reload(self):
        self._index(1, "/circle.png")
        from app.matcher import ProductMatcher

        reloaded = ProductMatcher(Path(os.environ["CV_INDEX_PATH"]))
        self.assertEqual(reloaded.stats()["indexed_products"], 1)


if __name__ == "__main__":
    unittest.main()
