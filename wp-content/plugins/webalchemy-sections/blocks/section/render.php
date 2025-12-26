<?php
$animation = isset($attributes['animation']) ? sanitize_title($attributes['animation']) : '';
$extra     = isset($attributes['extraClass']) ? sanitize_html_class($attributes['extraClass']) : '';

$classes = ['wa-section'];
if ($animation) $classes[] = 'wa-anim-' . $animation;
if ($extra)     $classes[] = $extra;
$data = $animation ? ' data-wa-anim="' . esc_attr($animation) . '"' : '';

echo '<section class="' . esc_attr(implode(' ', $classes)) . '"' . $data . '>';
echo '<div class="wa-section__inner">';
echo $content;
echo '</div>';
echo '</section>';
