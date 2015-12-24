$('.pan-box').click(function () {
    if ($(this).attr('data-pan') === 'baidu') {
        $.ajax({url: "http://pan.baidu.com/api/list?channel=chunlei&clienttype=0&web=1&num=100&page=1&dir=/&order=time&desc=1&showempty=0&channel=chunlei&clienttype=0&web=1&app_id=250528&_=" + new Date().getTime()})
            .done(function (data) {
              alert(JSON.stringify(data));
            })
            .fail(function (data) {
            });
    }

});

