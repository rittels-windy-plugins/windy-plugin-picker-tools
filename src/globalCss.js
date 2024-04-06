
const globalCss = `<style id='stylesheet-for-windy-plugin-picker-tools'>#plugin-windy-plugin-picker-tools{opacity:.7}#picker-div-right{display:none;white-space:nowrap;padding:4px;font-size:12px;line-height:1.1}#picker-div-right span{padding:0px}#picker-div-right.show{display:inline-block}#picker-div-left{display:none;position:absolute;right:2px;white-space:nowrap;padding:4px;font-size:12px;line-height:1.1}#picker-div-left span{padding:0px}#picker-div-left.show{display:inline-block}.picker-anchor-mobl{position:fixed;top:85px;width:0px;left:50vw}.pickerTools-desk #picker-div-left{background-color:transparent;border-radius:8px 0px 0px 8px;margin-right:1px}.pickerTools-desk #picker-div-right{padding-right:20px}.pickerTools-desk .picker-content [data-ref='content']{display:table-cell}#mobile-div-wrapper{display:flex;flex-direction:row;justify-content:space-between;margin:0 10px 10px 10px;padding:.5em 1em;border:solid 1px gray;overflow:hidden}#mobile-div-wrapper.hidden{display:none}.pickerTools-mobile #picker-div-left{position:relative;padding:0px;right:auto;background-color:transparent}.pickerTools-mobile #picker-div-right{position:relative;padding:0px;background-color:transparent}</style>`;
let globalCssNode;
function insertGlobalCss(){
    if(!document.querySelector("#stylesheet-for-windy-plugin-picker-tools")){
        document.head.insertAdjacentHTML('beforeend', globalCss);
        globalCssNode = document.querySelector("#stylesheet-for-windy-plugin-picker-tools");
    }
}
function removeGlobalCss(){
    if(globalCssNode){
        globalCssNode.remove();
    }
}
export { globalCssNode, insertGlobalCss, removeGlobalCss };
