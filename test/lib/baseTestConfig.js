
angular.module('test', ['anvde', 'legendDirectives']);

// load the controller's module
beforeEach(module('test'));
// environment
var $scope,
    $compile,
    $rootScope,
    nvd3Helpers;


// Initialize the controller and a mock scope
beforeEach(inject(function ($controller, _$rootScope_, _$compile_, _nvd3Helpers_) {
  $rootScope = _$rootScope_;
  $compile = _$compile_;
  nvd3Helpers = _nvd3Helpers_;
  $scope = $rootScope.$new();
}));


/**
 * Test data set 1.
 */
beforeEach(function () {
  $scope.statistics = {
    data: [
      { "key": "Serie 1", "values": [
        [ 1025409600000 , 10],
        [ 1028088000000 , 120],
        [ 1030766400000 , 200]
      ] },
      { "key": "Serie 2", "values": [
        [ 1025409600000 , 1010],
        [ 1028088000000 , 70],
        [ 1030766400000 , 250]
      ] }
    ],

    options: {
      width: 1450,
      height: 200,
      showXAxis: true,
      showYAxis: true,
      showValues: true,
      showLegend: true,
      showControls: true,
      interactive: true,
      tooltips: true,
      margin: {left:50,top:0,bottom:20,right:0},
      valueFormat: function (d) {
        return $scope.statistics.options.format(d);
      },
      x: function (d) { return d[0]; },
      y: function (d) { return d[1]; },
      xAxis: {
        tickFormat : function (d) { return d3.time.format('%m/%y')(new Date(d)); }
      },
      yAxis: {
        tickFormat : function (d) { return d3.format('d')(d); }
      },
      colorArray: ['#FF0000', '#0000FF', '#FFFF00', '#00FFFF'],
      color: function (d, i) {
          return $scope.statistics.options.colorArray[i];
      },
      tooltipContent: function (key, x, y, e, graph) {
          return  'Super New Tooltip' + '<h1>' + key + '</h1>' + '<p>' + y + ' at ' + x + '</p>';
      },
      format: d3.format(',.2f')
    }
  };
});

// polyfill
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis
                  ? this
                  : oThis,
              aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}