
console.log("RUNNING PICKERTOOLS");

import plugins from '@windy/plugins';
import { map } from '@windy/map';
import { emitter as picker } from '@windy/picker';
import rs from '@windy/rootScope';
import utils from '@windy/utils';

import config from './pluginConfig.js';
import { insertGlobalCss, removeGlobalCss } from './globalCss.js';


const { log } = console;
const { title, name } = config;
const { $ } = utils;
let thisPlugin;

let hasHooks = false;

let activePlugin;
let pckEl;
let pckr = { _icon: null };

let mobilePicker = rs.isMobileOrTablet;

/** lru list of plugins using the picker divs  */
let leftPlugins = [],
    rightPlugins = [];

let leftDivAct, rightDivAct;

// Make html
const mobWrapper = document.createElement('div');
mobWrapper.id = 'mobile-div-wrapper';
let pdl, pdr;
function makePdl() {
    pdl = document.createElement('div');
    pdl.id = 'picker-div-left';
    mobWrapper.appendChild(pdl);
}
function makePdr() {
    pdr = document.createElement('div');
    pdr.id = 'picker-div-right';
    mobWrapper.appendChild(pdr);
}

// init

const init = function () {
    thisPlugin = plugins[name];
    thisPlugin.isActive = true;  // still needed here since used by loadPlugin fx in other modules. 

    if (hasHooks) return;

    insertGlobalCss();
    document.body.classList.add(mobilePicker ? 'pickerTools-mobile' : 'pickerTools-desk');
    thisPlugin.closeCompletely = closeCompletely;
    if(!thisPlugin.exports) thisPlugin.exports = exports;
}

//// send text to picker div.

function mobileDiv(d) {
    if (mobilePicker && $('.plugin-content-top')) {
        if (mobWrapper.children.length == 0) {
            mobWrapper.appendChild(pdl);
            mobWrapper.appendChild(pdr);
        }
        pckEl = $('.plugin-content-top');

        if (!pckEl.contains(d)) {
            pckEl.appendChild(d);
        }
    }
}

function addContent(html, el) {
    if (html) {
        let show = true;
        if (html.nodeName == 'DIV') {
            if (html.innerHTML) {
                for (; el.firstChild;) el.firstChild.remove();
                el.appendChild(html);
            } else show = false;
        } else el.innerHTML = html;
        if (show) el.classList.add('show');
    } else {
        el.classList.remove('show');
    }
    if (mobilePicker && $('#plugin-picker-mobile')) {
        mobWrapper.classList[
            pdr.classList.contains('show') || pdl.classList.contains('show')
                ? 'remove'
                : 'add'
        ]('hidden');
    }
}

const fillRightDiv = function (html, mobStyle) {
    if (!pdr) makePdr();
    if (!mobilePicker) {
        if ($('.picker-content')) {
            pckEl = $('.picker-content');
            if (!pckEl.contains(pdr)) {
                pckEl.parentNode.style.outlineStyle = 'none'; //on my tablet long touching picker causes a persistent orange outline.  this stops it.
                pckEl.appendChild(pdr);
            }
        }
    } else mobileDiv(mobWrapper);
    if (mobStyle) Object.assign(pdr.style, mobStyle);
    addContent(html, pdr);
};

const fillLeftDiv = function (html, pickerBckgCol = false, mobStyle) {
    if (!pdl) makePdl();
    //default pickerBckgCol=false is transparent,  if true= "rgba(68,65,65,0.84)"
    if (pickerBckgCol && !mobilePicker) pdl.style.backgroundColor = 'rgba(68,65,65,0.84)';
    else pdl.style.backgroundColor = 'transparent';
    if (!mobilePicker) {
        if ($('.picker-content')) {
            pckEl = $('.picker-content');
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

/*
const hideLeftDiv = function () {
    pdl.style.display = 'none';
};
const hideRightDiv = function () {
    pdr.style.display = 'none';
};
const showLeftDiv = function () {
    pdl.style.display = 'inline-block';
};
const showRightDiv = function () {
    pdr.style.display = 'inline-block';
};

*/

const isOpen = function () {
    return getParams();
};

const getParams = function () {
    let params =
        (!mobilePicker && plugins.picker.plugin?.getParams()) ||
        (mobilePicker && plugins['picker-mobile'].plugin?.getParams()) ||
        false;
    return params;
};
//};

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
            ll = getParams();
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

    if (!mobilePicker) {
        if (!pckr._icon) {
            map.eachLayer(l => {
                if (
                    l.options &&
                    l.options.icon &&
                    l.options.icon.options.className == 'picker open'
                ) {
                    pckr = l;
                    pckr.on('drag', onDrag);
                }
            });
            if (!pckr._icon) {
                if (tries < 4) setTimeout(wait4pckr, 500, tries + 1);
            }
        } else {
            // console.log("Picker already open,  and pckr = picker marker,  add drag");
            pckr.on('drag', onDrag);
        }
    } else {
        // log('added onDrag to map,  may already be added,  but doesnt matter for Leaflet??');
        map.on('move', onDrag);
    }
}

/**
 * Remove the listeners from picker Marker and map.
 */
function remListeners() {
    map.off('move', onDrag);
    if (pckr.off) pckr.off('drag', onDrag);
}

//--picker drag listener
/**
 * Adds a function to the dragFxs array
 * @param {*} cbf
 * @param {*} interv,   by default the picker is cbf is requested every 100ms when dragged.
 */
const drag = function (cbf, interv = 100,) {
    dragFxs.push({ cbf, interv, ready: true, sendIfNotMoved: null }); //sendIfNotMoved : send coords if map or picker has not moved after the interval.

    wait4pckr(0); //in case picker has already been opened;
    //error occurs if resubscribe,  I dont think it matters though:
    if (dragFxs.length == 1) {
        picker.on('pickerOpened', wait4pckr);
        picker.on('pickerClosed', remListeners);
    }
};

/**  if no dragListeners and no plugins using the left or right divs,  close completeley */
function checkIfMustClose() {
    if (dragFxs.lenght == 0 && leftPlugins.length == 0 && rightPlugins.length == 0) {
        closeCompletely();
    }
}

const dragOff = function (cbf) {
    let ix = dragFxs.findIndex(e => e.cbf === cbf);
    if (ix >= 0) {
        console.log("dragOff:   removing:", dragFxs[ix]);
        dragFxs.splice(ix, 1);
    }
    if (dragFxs.length == 0) {
        picker.off('pickerOpened', wait4pckr);
        picker.off('pickerClosed', remListeners);
        remListeners();
        checkIfMustClose();
    }
};

const setActivePlugin = plugin => (activePlugin = plugin);

const getActivePlugin = () => activePlugin;

function checkLeftDiv() {
    if (leftDivAct !== leftPlugins[0]) {
        pdl?.remove();
    }
    leftDivAct = leftPlugins[0];
}
function checkRightDiv() {
    if (rightDivAct !== rightPlugins[0]) {
        console.log("pdr", pdr);
        pdr?.remove();
    }
    rightDivAct = rightPlugins[0];
}

const addLeftPlugin = (plugin) => {
    leftPlugins = leftPlugins.filter(p => p !== plugin);
    leftPlugins.unshift(plugin);
    checkLeftDiv();
};

const getLeftPlugin = () => leftDivAct;

const remLeftPlugin = plugin => {
    leftPlugins = leftPlugins.filter(p => p !== plugin);
    checkLeftDiv();
    checkIfMustClose();
};

const addRightPlugin = plugin => {
    rightPlugins = rightPlugins.filter(p => p !== plugin);
    rightPlugins.unshift(plugin);
    checkRightDiv();
};

const getRightPlugin = () => rightPlugins[0];

const remRightPlugin = plugin => {
    rightPlugins = rightPlugins.filter(p => p !== plugin);
    checkRightDiv();
    checkIfMustClose();
};

const closeCompletely = function () {

    log("close picker completely");

    // remove stuff from picker
    if (pdr) pdr.remove();
    if (pdl) pdl.remove();
    pdr = null;
    pdl = null; //why null?  if picker is closed,  then there is no parent to remove from and remove() does not work;
    mobWrapper?.remove();

    // this is probably not needed,  since when all the drag functions are removed,  these should be unsubscribed.
    remListeners();
    picker.off('pickerOpened', wait4pckr);  // this is probably not needed
    picker.off('pickerClosed', remListeners); // also probably not needed,   
    //
    document.body.classList.remove('pickerTools-mobile', 'pickerTools-desk');
    removeGlobalCss();
    thisPlugin.isActive = false;

    hasHooks = false;
};

// these are not exported to the svelte plugin,  rather attached as W.plugins['windy-plugin-picker-tools].exports
const exports = {
    pckr,
    fillRightDiv,
    fillLeftDiv,
    isOpen,
    getParams,
    drag,
    dragOff,
    setActivePlugin,
    getActivePlugin,
    addLeftPlugin,
    getLeftPlugin,
    remLeftPlugin,
    addRightPlugin,
    getRightPlugin,
    remRightPlugin
}

export {init}