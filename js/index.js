/**
 * Created by WL on 2017/3/7.
 */
//js开始
$(function () {
//    一,设置吸顶效果
    var off_top=$('.nav').offset().top;
    $(window).on('scroll', function () {
        //alert(off_top);
        var scr_top=$(window).scrollTop();
        if(scr_top>75){//头部图片不见,就让导航条中左边的logo图片显示;
            $('.nav').css({'position':'fixed','top':0});
            $('.nav img').css({'visibility':'visible'});
        }else{
            $('.nav').css({'position':'fixed','top':off_top});
            $('.nav img').css({'visibility':'hidden'});
        }
    });
//    二,设置返顶效果
    $(window).on('scroll', function () {
        var scr_top=$(window).scrollTop();
        if(scr_top>75){//导航条左边logo出现时,返顶图标一起出现;
            $('.returnTop').fadeIn(200);
        }else{
            $('.returnTop').fadeOut(200);
        }
        //点击图片.返回顶部
        $('.returnTop').on('click', function () {
            $('html body').animate({scrollTop:0});//是animate()不是css(),动画返回;
        });
    });
//    三,点击提交按钮,添加对应的li
    var itemArray;
    itemArray=store.get('itemArray')||[];
    render_view();
    $('input[type=submit]').on('click', function (event) {
        event.stopPropagation();
        var inp_content=$('input[type=text]').val();
        if($.trim(inp_content)==''){
            alert('请输入内容');
            return;
        }else{//创建事项
            var item= {
                title: '',
                content: '',
                isCheck: false,
                remind_time: '',
                is_notice: false
            }
            item.title=inp_content;
            itemArray.push(item);
            render_view();
        }
    });
    function render_view(){//创建添加li的函数
        store.set('itemArray',itemArray);
        $('.task').empty();
        $('.finishTask').empty();
        for (var i = 0; i < itemArray.length; i++) {
            var obj=itemArray[i];
            if(obj==undefined||!obj){
                continue;
            }
            var tag='<li data-index='+ i +' >'+//data-index给li绑定索引
                '<input type="checkbox"'+(obj.isCheck?'checked':'')+' >'+//三目判断是否选中
                '<span class="item_title">'+ obj.title +' </span>'+
                '<span class="del">删除</span>'+
                '<span class="detail">详情</span>'+
                '</li>';
            if(obj.isCheck){
                $('.finishTask').prepend(tag);
            }else{
                $('.task').prepend(tag);
            }
        }
    }
//    四,待办与完成tab切换
    $('.header li').click(function () {
        $(this).addClass('curr').siblings().removeClass('curr');
        var index=$(this).index();
        $('.body').eq(index).addClass('active').siblings().removeClass('active');
    })

//    五,点击删除,删除对应li(代理模式实现)
    $('body').on('click','.del', function () {
        var item=$(this).parent();
        var index=item.data('index');
        if(index==undefined||!itemArray[index])return;
        delete itemArray[index];//删除元素
        item.slideUp(200, function () {
            item.remove();//删除页面中的li
        })
        store.set('itemArray',itemArray);//存储数据
    });
//    六,点击勾选,让其添加到完成事项(代理模式)
    $('body').on('click','input[type=checkbox]', function () {
        var item=$(this).parent();
        var index=item.data('index');
        if(index==undefined||!itemArray[index])return;
        var obj=itemArray[index];
        obj.isCheck=$(this).is(':checked');
        itemArray[index]=obj;
        render_view();//调用函数,自动存储数据
    });
//    七,点击详情,显示模态窗口
    var cur_content=0;//记录点击的是哪个li
    $('body').on('click','.detail', function () {
        $('.mask').fadeIn();
        var item=$(this).parent();
        var index=item.data('index');
        cur_content=index;
        var obj=itemArray[index];
        $('.detail_header .title').text(obj.title);
        $('.detail_body textarea').val(obj.content);
        $('.detail_body input[type=text]').val(obj.remind_time);
    });
//    八,点击模态窗口界面,做对应的事
    $('.mask').click(function () {
        $(this).fadeOut();
        //alert('mask被点击了');
    });
    $('.close').click(function () {
        //event.stopPropagation();
        //alert('close被点击了');
        $('.mask').fadeOut();
    });
    //$('.detail_header').click(function (event) {
    //    var event=event||window.event;
    //    event.stopPropagation();
    //    //$('.mask').fadeOut();
    //});
    //$('.detail_header').click(function (event) {
    //    //$('.mask').fadeOut();
    //    event.stopPropagation();
    //    alert('header被点击了');
    //});
    //$('.detail_content .detail_header').click(function (event) {
    //    event.stopPropagation()
        //$('.mask').fadeOut();
    //})
    $('.detail_content').click(function (event) {
        alert(event);
        console.log(event);
        event.stopPropagation();//阻止事件冒泡;
        //$('.mask').css({'display':'block'});
    });
    //点击详情里的输入框,显示时间;
    $.datetimepicker.setLocale('ch');
    $('#data_time').datetimepicker();
//    九,模态窗口输入框输入内容,点击更新,更新界面
    $('.detail_body button').click(function () {
        var item=itemArray[cur_content];
        item.title=$('.detail_body textarea').val();
        item.remind_time=$('.detail_body input[type=text]').val();
        item.is_notice=false;
        itemArray[cur_content]=item;
        store.set('itemArray',itemArray);//存储数据;
        render_view();//更新界面;
        $('.mask').fadeOut();//让模态窗口消失;
    });
//    十,设置提醒时间
    setInterval(function () {
        var cur_time=(new Date()).getTime();//获取当前时间毫秒数;
        for (var i = 0; i < itemArray.length; i++) {
            var item=itemArray[i];
            if(item==undefined||!item||item.remind_time.length<1){continue;}
            var rem_time=(new Date(item.remind_time)).getTime();//获取事件里提醒时间的毫秒数;
            if(cur_time-rem_time>1){
                $('video').get(0).play();
                $('video').get().currentTime=0;//闹铃响起
                item.is_notice=true;//将时间中的提醒更新为已提醒;
                itemArray[i]=item;//将更新后的事件放到数组索引值对应的元素中;
                store.set('itemArray',itemArray);//存储数据
            }
        }
    },5000);
});
//    js结束