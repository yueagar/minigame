(($) => {
    $("head").append(`<script src="main.js?v=${Date.now()}"></script>`);
    $("head").append(`<link href="main.css?v=${Date.now()}" rel="stylesheet" type="text/css">`);
})(window.jQuery);