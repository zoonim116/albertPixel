<?php

$vicky->addAction('enqueue_block_editor_assets', 'Albert Pixel Gutenberg Scripts', function () {

    $asset_file = include(plugin_dir_path(__FILE__) . 'block/build/index.asset.php');
    wp_enqueue_script(
        'albert_pixel_editor',
        get_template_directory_uri().'/../app/Controllers/albert_pixel/block/build/index.js',
        $asset_file['dependencies'],
        $asset_file['version'],
        true
    );
    wp_enqueue_style('albert_pixel_editor_css', get_template_directory_uri().'/../app/Controllers/albert_pixel/block/build/index.css');
});

add_filter('render_block', function ($block_content, $block) {

    /**
     * Hold blocks that should fire the albert pixel event
     * Anchor link with specific class gets the albert-pixel class added to it.
     *
     * @key block: name of block that should fire the albert lead event on click
     * @key class: elements with class will fire the albert lead event on click
     */
    $allowed = [
        [
            'block' => 'core/button',
            'class' => 'wp-block-button__link'
        ],
        [
            'block' => 'atomic-blocks/ab-button',
            'class' => 'ab-button'
        ]
    ];

    // Get array key for block that should trigger the fb lead event
    $key = array_search($block['blockName'], array_column($allowed, 'block'));

    // No match for block
    if ($key === false) {
        return $block_content;
    }

    // Hold html contents of block
    $dom = new DOMDocument;
    $dom->loadHTML(mb_convert_encoding($block_content, 'HTML-ENTITIES', 'UTF-8'));

    // Return if no anchor elements in block
    if ($dom->getElementsByTagName('a')->length == 0) {
        return $block_content;
    }

    // Iterate anchor elements in block
    foreach ($dom->getElementsByTagName('a') as $anchor) {
        // Get anchor element classes
        $classes = explode(" ", $anchor->getAttribute('class'));

        // Element doesn't have target class, continue
        if (!in_array($allowed[$key]['class'], $classes)) {
            continue;
        }

        // Element is a button with no href attribute
        if ($anchor->getAttribute('href')->length == 0) {
            $wrapper = $dom->getElementsByTagName('div')[0];
            $wrapper_classes = $wrapper->getAttribute('class');
            $wrapper->setAttribute('class',  "$wrapper_classes has-".$block['attrs']['textColor']."-color");
        }

        // Add albert-pixel class to element and save html
        $classes[] = 'albert-lead';
        $anchor->setAttribute('class', implode(" ", $classes));
        $block_content = $dom->saveHTML();
    }

    return $block_content;
}, 10, 2);
