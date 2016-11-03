//定义所需变量
var ajaxhome = 'www.lovewsy.com'; // 填入主页地址
var ajaxcontent = 'content'; // 为Ajax加载部分的id，一般的主题主体都是content
var ajaxsearch_class = 'searchform'; // 搜索表单的class，同样，一般都是类似于searchform这种的
var ajaxignore_string = new String('#, /wp-, .pdf, .zip, .rar, /goto'); // 不需要Ajax加载的链接格式
var ajaxignore = ajaxignore_string.split(', ');// 字符分割
var ajaxloading_code = 'loading'; // 加载动画
var ajaxloading_error_code = 'error'; // 加载失败动画

var ajaxreloadDocumentReady = false; //重新加载
var ajaxtrack_analytics = false
var ajaxscroll_top = true // 定位返回锚点
var ajaxisLoad = false; // ajax加载开关
var ajaxstarted = false; // ajax开始确认
var ajaxsearchPath = null; // 搜索路径


// 初始化载入
$(document).ready(function () {
    ajaxloadPageInit("");
});
// 函数：搜索提交
function submitSearch(param) {
    if (!ajaxisLoad) {
        ajaxloadPage(ajaxsearchPath, 0, param);
    }
}
// 函数：过滤链接
function ajaxcheck_ignore(url) {
    for (var i in ajaxignore) {
        if (url.indexOf(ajaxignore[i]) >= 0) {
            return false;
        }
    }
    return true;
}
// 函数：需要重新加载的js，比如灯箱、代码高亮等
function ajaxreload_code() {
    //add code here
}
// 函数：导航菜单高亮切换
function ajaxclick_code(thiss) {
    $('ul.bar li').each(function () { // 设置成你的菜单列表li
        $(this).removeClass('current-menu-item');
    });
    $(thiss).parents('li').addClass('current-menu-item');
}
// 核心函数：ajax加载
function ajaxloadPage(url, push, getData) {
    if (!ajaxisLoad) {
        if (ajaxscroll_top == true) { // 返回顶部
            $('html,body').animate({ scrollTop: 0 }, 500); // 返回位置和速度
        }
        ajaxisLoad = true; // 开启
        ajaxstarted = true; // 开始
        nohttp = url.replace("http://", "").replace("https://", ""); // 去除https或http
        firstsla = nohttp.indexOf("/"); // 是否存在 / 符号
        pathpos = url.indexOf(nohttp); // 是否存在完整链接
        path = url.substring(pathpos + firstsla); // 切割提取字符串

        if (push != 1) {
            if (typeof window.history.pushState == "function") { // 浏览器地址变更
                var stateObj = { foo: 1000 + Math.random() * 1001 };
                history.pushState(stateObj, "ajax page loaded...", path);
            } else {
            }
        }
        if (!$('#' + ajaxcontent)) {
        }
        $('#' + ajaxcontent).append(ajaxloading_code); // 加载动画
        $('#' + ajaxcontent).fadeTo("slow", 0.4, function () { // 淡出效果
            $('#' + ajaxcontent).fadeIn("slow", function () { // 淡入效果
                $.ajax({
                    type: "GET",
                    url: url,
                    data: getData,
                    cache: false,//设为false时,ajax分页链接会出现错误
                    dataType: "html",
                    success: function (data) { // 加载成功后
                        ajaxisLoad = false; // 关闭ajax

                        datax = data.split('<title>');
                        titlesx = data.split('</title>');
                        if (datax.length == 2 || titlesx.length == 2) {  // 浏览器标题变更
                            data = data.split('<title>')[1];
                            titles = data.split('</title>')[0];
                            $(document).attr('title', ($("<div/>").html(titles).text()));
                        } else {

                        }

                        if (ajaxtrack_analytics == true) {
                            if (typeof _gaq != "undefined") {
                                if (typeof getData == "undefined") {
                                    getData = "";
                                } else {
                                    getData = "?" + getData;
                                }
                                _gaq.push(['_trackPageview', path + getData]);
                            }
                        }

                        data = data.split('id="' + ajaxcontent + '"')[1];
                        data = data.substring(data.indexOf('>') + 1);
                        var depth = 1;
                        var output = '';

                        while (depth > 0) {
                            temp = data.split('</div>')[0];
                            i = 0;
                            pos = temp.indexOf("<div");
                            while (pos != -1) {
                                i++;
                                pos = temp.indexOf("<div", pos + 1);
                            }
                            depth = depth + i - 1;
                            output = output + data.split('</div>')[0] + '</div>'; //分割字符串
                            data = data.substring(data.indexOf('</div>') + 6);
                        }
                        document.getElementById(ajaxcontent).innerHTML = output;
                        $('#' + ajaxcontent).css("position", "absolute");
                        $('#' + ajaxcontent).css("left", "20000px");
                        $('#' + ajaxcontent).show();
                        ajaxloadPageInit("#" + ajaxcontent + " ");

                        if (ajaxreloadDocumentReady == true) {
                            $(document).trigger("ready");
                        }
                        try {
                            ajaxreload_code();
                        } catch (err) {
                        }
                        $('#' + ajaxcontent).hide();
                        $('#' + ajaxcontent).css("position", "");
                        $('#' + ajaxcontent).css("left", "");
                        $('#' + ajaxcontent).fadeTo("slow", 1, function () { });
                    },
                    error: function (jqXHR, textStatus, errorThrown) { // 加载错误时提示
                        ajaxisLoad = false;
                        document.title = "Error loading requested page!";
                        document.getElementById(ajaxcontent).innerHTML = ajaxloading_error_code;
                    }
                });
            });
        });
    }
}
// 后退时页面效果，用popstate
window.onpopstate = function (event) {
    if (ajaxstarted === true && ajaxcheck_ignore(document.location.toString()) == true) {
        ajaxloadPage(document.location.toString(), 1);
    }
};
//函数: ajax加载
function ajaxloadPageInit(scope) {
    $(scope + "a").click(function (event) { // 点击事件绑定a标签
        if (this.href.indexOf(ajaxhome) >= 0 && ajaxcheck_ignore(this.href) == true) {
            event.preventDefault();
            this.blur();
            var caption = this.title || this.name || "";
            var group = this.rel || false;
            try {
                ajaxclick_code(this);
            } catch (err) {
            }
            ajaxloadPage(this.href); // 核心函数
        }
    });

    $('.' + ajaxsearch_class).each(function (index) { // 搜索ajax
        if ($(this).attr("action")) {
            ajaxsearchPath = $(this).attr("action");;
            $(this).submit(function () {
                submitSearch($(this).serialize());
                return false;
            });
        }
    });

    if ($('.' + ajaxsearch_class).attr("action")) { } else {
    }
}