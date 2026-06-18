<?php
/**
 * HTML e-mail body for a shared recipe.
 *
 * @var \App\View\AppView $this
 * @var \App\Model\Entity\Recipe $recipe
 * @var string|null $imageCid Content id of the inline image, or null.
 */
?>
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #d35400;"><?= h($recipe->title) ?></h1>
    <p style="color: #777; font-size: 13px;">
        Created: <?= h($recipe->created->format('d.m.Y')) ?>
        <?php if ($recipe->temperature !== null) : ?>
            &middot; <?= h((string)$recipe->temperature) ?> °C
        <?php endif; ?>
        <?php if ($recipe->duration !== null) : ?>
            &middot; <?= h((string)$recipe->duration) ?> min
        <?php endif; ?>
    </p>

    <?php if (!empty($imageCid)) : ?>
        <img src="cid:<?= h($imageCid) ?>" alt="<?= h($recipe->title) ?>"
             style="max-width: 100%; border-radius: 6px; margin: 8px 0;">
    <?php endif; ?>

    <h2 style="font-size: 16px;">Ingredients</h2>
    <ul>
        <?php foreach ($recipe->ingredients as $ingredient) : ?>
            <li>
                <?= h(rtrim(rtrim($ingredient->amount, '0'), '.')) ?><?= h($ingredient->unit) ?>
                <?= h($ingredient->name) ?>
            </li>
        <?php endforeach; ?>
    </ul>

    <?php if (!empty($recipe->description)) : ?>
        <h2 style="font-size: 16px;">Description</h2>
        <p><?= nl2br(h($recipe->description)) ?></p>
    <?php endif; ?>

    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
    <p style="color: #999; font-size: 12px;">Shared from the Recipe Collection.</p>
</div>
