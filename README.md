# Picker tools

Plugin that adds a drag listener to the picker marker in desktop,  or to the map in mobile.  

Also adds Divs to the left or right of the picker.  

This is not a standalone plugin.  It  provides methods,  which can then be used by other plugins.  

## Methods:

These methods live in `W.plugins['windy-plugin-picker-tools'].exports` :

`drag( cbf , interval )` : cbf is a callback function receiving coords  and interval is ms,  interval at which the cbf is called when dragged,  default is 100.  

`dragOff( cbf )` : removes the cbf.

`getParams()` : returns the coords,  `isOpen()` does the same.  

`fillRightDiv and fillLeftDiv ( text | DOM structure where the top element is a DIV)` : Fills the left and right divs respectively.  

`addLeftPlugin and addRightPlugin ( plugin-name )` :  
Adds your plugin name to a list of plugins,  where the last plugin added has priority.  

`getLeftPlugin() and getRightPlugin()` :  Returns the name of the 1st of each list.  At the moment,  the controlling plugin should check if it has priority so:
 ``` 
 if (getLeftPlugin() == "windy-plugin-my-plugin") fillLeftDiv( html ) 
 ```  

`remLeftPlugin and remRightPlugin (plugin-name)` : Removes the plugin-name from the list.

`setActivePlugin( name ) and getActivePlugin` : Avoid using these.   

## Import these functions like this:

```
let pickerT;
installExternalPlugin(url, 'url')
    .then(() => plugins['windy-plugin-picker-tools'].open())
    .then(() => pickerT = plugins['windy-plugin-picker-tools'].exports);
```
Look at one of my plugins to see how it works.

## Closing 'windy-plugin-picker-tools'

This plugin will automatically close when the leftPlugin and rightPlugin lists are empty,  and all the cbfs have been removed. 


_This plugin is a work in progress._   

















