# How to work with it?

To provide chart model you use ng-model. That's it! nvd3Chart attribute should have reference to configuration options for chart.

```html
<div nvd3-chart="options" ng-model="data"></div>
```

in this example:

* ```$scope.options``` should be object containing non default chart configuration. Each property name is looked up on chart object and if exists, option's property value will be passed to chart's function invocation.
* ```$scope.data``` should be chart's model.

There are working tests showing how to use it!

## Options

Directive invokes methods on chart object passing values from config. Configuring directive looks like this:

```javascript
$scope.options: {
  // this declares what type of chart will be used it has to exactly match 
  // nv.models.[chartType] method!
  chartType: 'multiBarChart',
  // this defines additional config parameters used to configure chart - see below
  chartSubType: [ 'highContrast', 'fancyToolTip' ],
  showLegend: true,
  showControls: true,
  showXAxis: true,
  showYAxis: true,
  showValues: true,
  margin: {left:50,top:0,bottom:20,right:0},
  valueFormat: function (d) { return $scope.statistics.options.format(d); },
  x: function (d) { return d[0]; },
  xAxis: {
    tickFormat : function (d) { return d3.time.format('%m/%y')(new Date(d)); }
  },
  toolTipContent: function (key, x, y, e, graph) {
    return  'Super New Tooltip' +
      '<h1>' + key + '</h1>' +
      '<p>' + y + ' at ' + x + '</p>';
  },
  format: d3.format(',.2f')
};
```

## chartType and chartSubType

```chartType``` must match function creating chart. It is used to find correct chart on ```nv.models```. Each chart type has it's own default properties configured in ```nvd3Helpers``` (injectable via angular).

```chartSubType``` defines additional sets of configuration parameters that will overwrite default ones.

## Chart default configuration

When configuring new chart instance, default configuration parameter's are gathered from ```nvd3Helpers```. There are three levels of default params:

* ```nvd3Helpers.defaults``` - default parameters for all charts
* ```nvd3Helpers.chartDefaults.[chartType]``` - define chart type specific parameters
* ```nvd3Helpers.chartSubTypeDefaults.[chartSubType]``` - define chart's dialects

The lower on list, configuration has higher priority. So subType configuration param overwrite default and chart ones. User may change default parameters at each level. Changes alternate only newely created charts. So existing ones stay as they were styled.
