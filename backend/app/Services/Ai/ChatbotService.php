<?php

namespace App\Services\Ai;

use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ChatbotService
{
    public function __construct(private OpenAiClient $openAi) {}

    /**
     * @param  array<int, array{role: string, content: string}>  $history
     * @return array{reply: string, products: Collection, source: string}
     */
    public function reply(?User $user, string $message, array $history = []): array
    {
        $products = $this->findMentionedProducts($message);

        if ($this->openAi->isConfigured()) {
            $aiReply = $this->openAi->chat($this->buildOpenAiMessages($user, $message, $history, $products));
            if ($aiReply) {
                return [
                    'reply' => trim($aiReply),
                    'products' => $products,
                    'source' => 'openai',
                ];
            }
        }

        return [
            'reply' => $this->localReply($message, $products, $user),
            'products' => $products,
            'source' => 'local',
        ];
    }

    private function buildOpenAiMessages(?User $user, string $message, array $history, Collection $products): array
    {
        $context = "Tu es l'assistant Vivid Shop, une boutique e-commerce marocaine (mode, tech, maison). "
            ."Réponds en français, court et utile. "
            ."Livraison sous 48h, retours 30 jours, paiement carte/PayPal/à la livraison. "
            ."Coupons possibles (ex: WELCOME10). "
            .($user ? "Client connecté : {$user->name}." : 'Visiteur non connecté.');

        if ($products->isNotEmpty()) {
            $context .= ' Produits pertinents : '.$products->map(
                fn (Product $p) => "{$p->name} ({$p->price} DH)"
            )->implode(', ').'.';
        }

        $messages = [
            ['role' => 'system', 'content' => $context],
        ];

        foreach (array_slice($history, -6) as $turn) {
            $messages[] = [
                'role' => $turn['role'] === 'assistant' ? 'assistant' : 'user',
                'content' => $turn['content'],
            ];
        }

        $messages[] = ['role' => 'user', 'content' => $message];

        return $messages;
    }

    private function localReply(string $message, Collection $products, ?User $user): string
    {
        $text = Str::lower($message);

        if (preg_match('/\b(bonjour|salut|hello|coucou)\b/u', $text)) {
            return $user
                ? "Bonjour {$user->name} ! Je suis l'assistant Vivid. Cherchez un produit, posez une question sur la livraison ou les retours."
                : "Bonjour ! Je suis l'assistant Vivid. Parcourez la boutique ou connectez-vous pour commander.";
        }

        if (preg_match('/livraison|expédition|délai/u', $text)) {
            return 'Nous expédions sous 48h ouvrées. Vous recevrez un email de confirmation après commande.';
        }

        if (preg_match('/retour|rembours|échange/u', $text)) {
            return 'Retours acceptés sous 30 jours. Contactez-nous depuis votre espace commandes.';
        }

        if (preg_match('/paiement|carte|paypal|espèce|livraison/u', $text)) {
            return 'Paiement par carte bancaire, PayPal ou à la livraison lors du checkout.';
        }

        if (preg_match('/coupon|promo|réduction|code/u', $text)) {
            return 'Entrez votre code promo au checkout (ex: WELCOME10). La réduction s\'applique sur le total.';
        }

        if (preg_match('/commande|suivi/u', $text)) {
            return $user
                ? 'Consultez « Mes commandes » dans votre profil pour suivre vos achats.'
                : 'Connectez-vous pour voir vos commandes dans la section « Mes commandes ».';
        }

        if (preg_match('/panier|acheter|ajouter/u', $text)) {
            return 'Ajoutez des articles au panier depuis la boutique, puis passez au checkout.';
        }

        if ($products->isNotEmpty()) {
            $names = $products->take(3)->pluck('name')->implode(', ');

            return "Voici des produits qui pourraient vous intéresser : {$names}. Cliquez pour voir les détails.";
        }

        return 'Je peux vous aider sur les produits, la livraison, les retours et les paiements. '
            .'Essayez « smartphone » ou « livraison ». '
            .'Pour l\'IA avancée, configurez OPENAI_API_KEY côté serveur.';
    }

    private function findMentionedProducts(string $message): Collection
    {
        $words = collect(preg_split('/\s+/u', Str::lower($message), -1, PREG_SPLIT_NO_EMPTY))
            ->filter(fn ($w) => mb_strlen($w) >= 3)
            ->take(5);

        if ($words->isEmpty()) {
            return collect();
        }

        $query = Product::query()->active()->with(['category']);

        $query->where(function ($q) use ($words) {
            foreach ($words as $word) {
                $q->orWhere('name', 'like', "%{$word}%")
                    ->orWhere('description', 'like', "%{$word}%");
            }
        });

        return $query->limit(4)->get();
    }
}
