Adding pickertools to the picker ...

<script lang="ts">
    import {  onMount } from 'svelte';
    import store from '@windy/store';
    import {init} from './pickertools_main.js';
    import config from './pluginConfig';

    const {  name } = config;
    const thisPlugin = W.plugins[name];

    onMount(() => {
    
        init();

        // Close immediately,   no need for delay,  just nice to see whats happening for now
        setTimeout(() => {
            thisPlugin.close();
        }, 2000);

        // Also remove plugin from stored installedPlugins,  so that it does not appear in the menu.
        // An pluginConfig option to specify whether should appear in menu would be useful
        let installedPlugins = store.get('installedPlugins');
        let filteredPlugins = installedPlugins.filter(e => e.name !== name);
        if (filteredPlugins.length < installedPlugins.length) {
            store.remove('installedPlugins');
            store.set('installedPlugins', filteredPlugins);
        }
    });
</script>

<style lang="less">
</style>
