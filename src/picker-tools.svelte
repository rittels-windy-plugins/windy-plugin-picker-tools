<div data-ref="mobile-div-wrapper" id="mobile-div-wrapper" class="rounded-box">
    <div data-ref="picker-div-left" id="picker-div-left"></div>
    <div data-ref="picker-div-right" id="picker-div-right"></div>
</div>

<script>
    import bcast from '@windy/broadcast';
    import { onDestroy, onMount } from 'svelte';
    import plugins from '@windy/plugins';
    import { map } from '@windy/map';
    import { emitter as picker } from '@windy/picker';
    import rs from '@windy/rootScope';
    import store from '@windy/store';
    import utils from '@windy/utils';

    import config from './pluginConfig';
    
    //import { globalCssNode, insertGlobalCss, removeGlobalCss } from './globalCss.js';

    const { log } = console;
    const { title, name } = config;
    const { $: u$ } = utils;

    let refs = {};

   // export const onopen = _params => {};

    let thisPlugin = plugins[name];
    let activePlugin;
    let pckEl;
    let pt = { pckr: { _icon: null } };
    let pdr, pdl, mobWrapper;
    let mobilePicker;

    //     let checkedForOverride = false;

    bcast.on('pluginOpened', e => {
        if (e == 'plugins') {
            for (let e of u$('#plugin-plugins').querySelectorAll('.card')) {
                if (u$('h3', e).innerHTML == 'Picker Tools') e.classList.add('hidden');
            }
        }
    });

    
    function onOverrideMobilePicker(override) {
        if (!rs.isMobileOrTablet) return; // this line should not be needed.
        mobilePicker = !override;
        //console.log('onOverrideMobilePicker:  use the mobile picker', mobilePicker);
        document.body.classList.add(mobilePicker ? 'pickerTools-mobile' : 'pickerTools-desk');
        document.body.classList.remove(!mobilePicker ? 'pickerTools-mobile' : 'pickerTools-desk');
        remListeners();
        wait4pckr();
        bcast.fire('rqstClose', 'picker-mobile');
        if (mobilePicker) {
            bcast.fire('rqstOpen', 'picker-mobile');
        }
        if (pdl && pdl.innerHTML) pt.fillLeftDiv(pdl.innerHTML);
        if (pdr && pdr.innerHTML) pt.fillRightDiv(pdr.innerHTML);

        //console.log("right div contains", pdr.innerHTML);
    }

    /**
     * If windy-plugin-picker2 opens,  check if picker should changed.
     * Then stop listener for pluginOpen
     */
    function changeToDesktopPickerIfPreferred(p) {
        if (p == 'windy-plugin-picker2' || p == 'picker2IsLoaded') {
            if (store.get('overrideMobilePicker')) {
                if (mobilePicker) {
                    onOverrideMobilePicker(true);
                }
            }
        }
        if (p == 'windy-plugin-picker2')
            bcast.off('pluginOpened', changeToDesktopPickerIfPreferred);
    }


    onMount(() => {
        //insertGlobalCss();
        
        //grab refs
        for (let e of thisPlugin.window.node.querySelectorAll('[data-ref]')) {
            refs[e.dataset.ref]=e;
        }

        mobilePicker = rs.isMobileOrTablet;

        /*
        if (store.hasProperty('overrideMobilePicker')) {
            console.log('picker2 module available');
            changeToDesktopPickerIfPreferred('picker2IsLoaded');
        } else {
            console.log(
                'picker2 module is not available yet,  if desktopOrMobile,  wait for picker2 to open,  then onOverrideMobile(true) if preferred in store',
            );
            if (rs.isMobileOrTablet) bcast.on('pluginOpened', changeToDesktopPickerIfPreferred);
        }
        */

        document.body.classList.add(mobilePicker ? 'pickerTools-mobile' : 'pickerTools-desk');

        //store.on('overrideMobilePicker', onOverrideMobilePicker);

        pdl = refs['picker-div-left'];
        pdr = refs['picker-div-right'];

        mobWrapper = refs['mobile-div-wrapper'];

        ////send text to picker div.
        function mobileDiv(d) {
            if (mobilePicker && u$('.plugin-content-top')) {
                if (mobWrapper.children.length == 0) {
                    mobWrapper.appendChild(pdl);
                    mobWrapper.appendChild(pdr);
                }

                pckEl = u$('.plugin-content-top'); //W.pickerMobile.popup;

                if (!pckEl.contains(d)) {
                    //pckEl.style.position="fixed";
                    //let pda=document.createElement("div");
                    //pda.classList.add("picker-anchor-mobl");
                    //pckEl.appendChild(pda);
                    //pda.appendChild(d);
                    pckEl.appendChild(d);
                }
            }
        }

        function addContent(html, el) {
            if (html) {
                let show = true;
                if (html.nodeName == 'DIV') {
                    if (html.innerHTML) {
                        for (; el.firstChild; ) el.firstChild.remove();
                        el.appendChild(html);
                    } else show = false;
                } else el.innerHTML = html;
                if (show) el.classList.add('show');
            } else {
                el.classList.remove('show');
            }
            if (mobilePicker && u$('#plugin-picker-mobile')) {
                mobWrapper.classList[
                    pdr.classList.contains('show') || pdl.classList.contains('show')
                        ? 'remove'
                        : 'add'
                ]('hidden');
            }
        }

        pt.fillRightDiv = function (html, mobStyle) {
            if (!mobilePicker) {
                //(!rs.isMobileOrTablet){
                if (u$('.picker-content')) {
                    pckEl = u$('.picker-content'); //W.pickerDesktop.popupContent;
                    if (!pckEl.contains(pdr)) {
                        pckEl.parentNode.style.outlineStyle = 'none'; //on my tablet long touching picker causes a persistent orange outline.  this stops it.
                        pckEl.appendChild(pdr);
                    }
                }
            } else mobileDiv(mobWrapper);
            if (mobStyle) Object.assign(pdr.style, mobStyle);
            addContent(html, pdr);
        };

        pt.fillLeftDiv = function (html, pickerBckgCol = false, mobStyle) {
            //pickerBckgCol=false is transparent,  true= "rgba(68,65,65,0.84)"
            if (pickerBckgCol && !mobilePicker) pdl.style.backgroundColor = 'rgba(68,65,65,0.84)';
            else pdl.style.backgroundColor = 'transparent';
            if (!mobilePicker) {
                if (u$('.picker-content')) {
                    //W.pickerDesktop && W.pickerDesktop.popupContent){
                    pckEl = u$('.picker-content'); //W.pickerDesktop.popupContent;
                    if (!pckEl.contains(pdl)) {
                        pckEl.parentNode.style.outlineStyle = 'none';
                        let pda = document.createElement('div');
                        pckEl.appendChild(pda);
                        Object.assign(pda.style, {
                            top: '0px',
                            width: '0px',
                            position: 'absolute',
                        });
                        pda.appendChild(pdl);
                    }
                }
            } else mobileDiv(mobWrapper);
            if (mobStyle) Object.assign(pdl.style, mobStyle);
            addContent(html, pdl);
        };

        //not sure if needed
        pt.hideLeftDiv = function () {
            pdl.style.display = 'none';
        };
        pt.hideRightDiv = function () {
            pdr.style.display = 'none';
        };
        pt.showLeftDiv = function () {
            pdl.style.display = 'inline-block';
        };
        pt.showRightDiv = function () {
            pdr.style.display = 'inline-block';
        };

        pt.removeElements = function () {
            //console.log("removing pdr and pdl");
            pdr.innerHTML = '';
            pdl.innerHTML = '';
        };

        pt.isOpen = function () {
            return pt.getParams();
        };

        pt.getParams = function () {
            let params =
                (!mobilePicker && W['@plugins/picker'] && W['@plugins/picker'].getParams()) ||
                (mobilePicker &&
                    W['@plugins/picker-mobile'] &&
                    W['@plugins/picker-mobile'].getParams());
            //console.log('picker params', params);
            return params;
        };
    });

    let dragFxs = [];

    /**
     * triggers array of  fxs in dragFxs,  when picker marker dragged or map dragged (depending on mobilePicker)
     */
    function onDrag(e) {
        let getLL = ll => {
            if (!mobilePicker) {
                ll = e.target._latlng;
                ll.lon = ll.lng;
            } else {
                ll = pt.getParams();
            }
            return ll;
        };

        dragFxs.forEach(f => {
            if (f.ready) {
                f.cbf(getLL());
                f.ready = false;
                clearTimeout(f.sendIfNotMoved);
                setTimeout(() => {
                    f.ready = true;
                    f.sendIfNotMoved = setTimeout(() => {
                        f.cbf(getLL());
                    }, f.interv);
                }, f.interv);
            }
        });
    }

    /**
     *  Add draglisterner,  that triggers all the dragFx,  to either map or picker marker,  depending on mobilePicker.
     * @param {*} tries try until tries=4
     */
    function wait4pckr(tries = 0) {
        console.log('wait for picker or map');
        if (!mobilePicker) {
            //!rs.isMobileOrTablet){
            if (!pt.pckr._icon) {
                map.eachLayer(l => {
                    if (
                        l.options &&
                        l.options.icon &&
                        l.options.icon.options.className == 'picker open'
                    ) {
                        pt.pckr = l;
                        pt.pckr.on('drag', onDrag);
                        console.log('added drag listener to picker marker');
                    }
                });
                if (!pt.pckr._icon) {
                    if (tries < 4) setTimeout(wait4pckr, 500, tries + 1);
                }
            }
        } else {
            console.log(
                'added onDrag to map,  may already be added,  but doesnt matter for Leaflet??',
            );
            map.on('move', onDrag);
        }
    }

    /**
     * Remove the listeners from picker Marker and map.
     */
    function remListeners() {
        map.off('move', onDrag);
        if (pt.pckr.off) pt.pckr.off('drag', onDrag);
    }

    //--picker drag listener
    /**
     * Adds a function to the dragFxs array
     * @param {*} cbf
     * @param {*} interv,   by default the picker is cbf is requested every 100ms when dragged.
     * @param {*} pluginIdent
     */
    pt.drag = function (cbf, interv = 100, pluginIdent) {
        dragFxs.push({ cbf, interv, ready: true, sendIfNotMoved: null }); //sendIfNotMoved : send coords if map or picker has not moved after the interval.

        wait4pckr(0); //in case picker has already been opened;
        //error occurs if resubscribe,  I dont think it matters though:
        if (dragFxs.length == 1) {
            picker.on('pickerOpened', wait4pckr);
            picker.on('pickerClosed', remListeners);
        }
    };

    pt.dragOff = function (cbf) {
        let ix = dragFxs.findIndex(e => e.cbf === cbf);
        if (ix != -1) dragFxs.splice(ix, 1);
        if (dragFxs.length == 0) {
            picker.off('pickerOpened', wait4pckr);
            picker.off('pickerClosed', remListeners);
            remListeners();
        }
    };

    pt.setActivePlugin = plugin => (activePlugin = plugin);
    pt.getActivePlugin = () => activePlugin;

    onDestroy(() => {
    
        pdr.remove();
        pdl.remove();
        pdr = null;
        pdl = null; //why?  if picker is closed,  then there is no parent to remove from and remove() does not work;
        mobWrapper.remove();
        remListeners();
        picker.off('pickerOpened', wait4pckr);
        picker.off('pickerClosed', remListeners);
        document.body.classList.remove('pickerTools-mobile', 'pickerTools-desk');
    });

    thisPlugin.exports = pt;

    
</script>

<style lang="less">
    @import 'picker-tools.less';
</style>
