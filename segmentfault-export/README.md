把SegmentFault专栏文章导出为Markdown文件的工具。


为把博客从SegmentFault迁移到掘金，需要把所有文章导出为Markdown文件，掘金自己有批量导入功能。

使用方法：
```bash
npm i
node export.js --id segmentfault
```
这里segmentfault是专栏id，也就是专栏主页链接的最后一段，比如https://segmentfault.com/blog/segmentfault对应的id为segmentfault。

运行后会在./result/id目录下生成所有文章的md文件。

------------------------

补充一个掘金删除所有草稿的小脚本，批量导入之后发现有问题回退了一次...
```js
deleteFirst = () => {
    document.querySelectorAll('.item .draft .menu-list')[0].children[1].click()
    setTimeout(() => {
        document.querySelector('.ctrl-btn.confirm-btn').click();
    }, 100);
}
deleteAll = () => {
    if(document.querySelectorAll('.item .draft .menu-list').length > 0) {
        deleteFirst();
        setTimeout(deleteAll,300);
    }
}
deleteAll()
```
