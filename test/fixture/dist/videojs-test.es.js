/*! @name videojs-manual-test @version 0.0.0 @license MIT */
var version = "0.0.0";

var Plugin = {}; // Default options for the plugin.

var defaults = {};
/**
 * An advanced Video.js plugin. For more information on the API
 *
 * See: https://blog.videojs.com/feature-spotlight-advanced-plugins/
 */

var ManualTest = /*#__PURE__*/function (_Plugin) {
  /**
   * Create a ManualTest plugin instance.
   *
   * @param  {Player} player
   *         A Video.js Player instance.
   *
   * @param  {Object} [options]
   *         An optional options object.
   *
   *         While not a core part of the Video.js plugin architecture, a
   *         second argument of options is a convenient way to accept inputs
   *         from your plugin's caller.
   */
  function ManualTest(player, options) {
    var _this;

    // the parent class will add player under this.player
    _this = _Plugin.call(this, player) || this;
    _this.options = videojs.mergeOptions(defaults, options);

    _this.player.ready(function () {
      _this.player.addClass('vjs-manual-test');
    });

    return _this;
  }

  return ManualTest;
}(Plugin); // Define default values for the plugin's `state` object here.


ManualTest.defaultState = {}; // Include the version number.

ManualTest.VERSION = version; // Register the plugin with video.js.

export default ManualTest;
