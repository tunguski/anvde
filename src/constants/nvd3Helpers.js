
angular.module('anvde')
    /*
     Common functions that sets up width, height, margin
     should prevent NaN errors
     */
    .constant('nvd3Helpers', (function () {
      function isArea (d) { return d.area; }
      function size (d) { return (d.size === undefined ? 1 : d.size); }
      function tooltipXContent (key, x) { return '<strong>' + x + '</strong>'; }
      function tooltipYContent (key, x, y) { return '<strong>' + y + '</strong>'; }

      var nvd3Helpers = {
        defaults: function () {
          return {
            margin: { left: 50, top: 50, bottom: 50, right: 50 },
            x: function(d){ return d[0]; },
            y: function(d){ return d[1]; },
            forceY: [0],
            showValues: false,
            tooltips: false,
            showXAxis: false,
            showYAxis: false,
            showLegend: false,
            showControls: false,
            interactive: false,
            noData: 'No Data Available.',
            staggerLabels: false,
            delay: 1200,
            color: nv.utils.defaultColor()
          };
        },


        chartDefaults: {
          bulletChart: {
            forceX: [],
            orient: 'left',
            tickFormat: null
          },
          cumulativeLineChart: {
            forceX: [],
            rightAlignYAxis: false,
            clipEdge: false,
            clipVoronoi: false,
            useVoronoi: false,
            average: function (d) { return d.average; },
            isArea: isArea
          },
          discreteBarChart: {
          },
          lineChart: {
            forceX: [],
            size: size,
            rightAlignYAxis: false,
            clipEdge: false,
            clipVoronoi: false,
            interpolate: 'linear',
            isArea: isArea
          },
          linePlusBar: {
            forceX: [],
            interpolate: 'linear'
          },
          lineWithFocusChart: {
            forceX: [],
            height2: 200,
            size: size,
            isArea: isArea,
            clipEdge: false,
            clipVoronoi: false,
            interpolate: 'liear'
          },
          multiBarChart: {
            groupSpacing: 0.1
          },
          multiBarHorizontalChart: {
            stacked: false
          },
          pieChart: {
            forceX: [],
            labelThreshold: 0.02,
            labelType: 'key',
            pieLabelsOutside: true,
            valueFormat: d3.format(',.2f'),
            description: function(d) { return d.description; },
            donutLabelsOutside: false,
            donut: false,
            donutRatio: 0.5
          },
          scatterChart: {
            forceX: [],
            size: size,
            forceSize: [],
            tooltipContent: null,
            tooltipXContent: tooltipXContent,
            tooltipYContent: tooltipYContent,
            showDistX: false,
            showDistY: false,
            xPadding: 0,
            yPadding: 0,
            fisheye: 0,
            transitionDuration: 250
          },
          scatterPlusLineChart: {
            forceX: [],
            size: size,
            tooltipContent: null,
            tooltipXContent: tooltipXContent,
            tooltipYContent: tooltipYContent,
            showDistX: false,
            showDistY: false,
            fisheye: 0,
            transitionDuration: 250
          },
          sparklinePlus: {
            forceX: [],
            xTickFormat: d3.format(',r'),
            yTickFormat: d3.format(',.2f'),
            showValue: true,
            alignValue: true,
            rightAlignValue: false
          },
          stackedAreaChart: {
            forceX: [],
            size: size,
            forceSize: [],
            clipEdge: false
          }
        },


        chartSubTypeDefaults: {

        },


        getD3Selector: function (attrs, element) {
          if (!attrs.id) {
            //if an id is not supplied, create a random id.
            if (!attrs['data-chartid']) {
              angular.element(element).attr('data-chartid', 'chartid' + Math.floor(Math.random() * 1000000001));
            }
            return '[data-chartid=' + attrs['data-chartid'] + ']';
          } else {
            return '#' + attrs.id;
          }
        },


        internalRewriteOptions: function (chart, options) {
          var special = {
            'yAxis': true,
            'y1Axis': true,
            'y2Axis': true,
            'xAxis': true,
            'x1Axis': true,
            'x2Axis': true,
            'legend': true
          };
          var invoke = {
            'scale': true
          };
          var internal = this.internalRewriteOptions;

          angular.forEach(options, function (value, key) {
            if (chart && angular.isFunction(chart[key]) && !special[key]) {
              if (!angular.isUndefined(value)) {
                chart = chart[key](value);
              }
            } else if (chart && special[key]) {
              internal(invoke[key] ? chart[key]() : chart[key], value);
            } else {
              if (key !== 'chartType') {
                //console.log('Unknown configuration option: ' + key);
              }
            }
          });
        },


        rewriteOptions: function (chart, options) {
          var chartSubTypeDefaults = this.chartSubTypeDefaults;
          var configSources = [];
          configSources.push(this.defaults());
          configSources.push(this.chartDefaults[options.chartType]);
          if (options.chartSubType) {
            angular.forEach(options.chartSubType, function (subType) {
              configSources.push(chartSubTypeDefaults[subType]);
            });
          }
          configSources.push(options);

          this.internalRewriteOptions(chart, this.merge.apply(this, configSources));
        },


        merge: function (dst) {
          var merge = this.merge;

          angular.forEach(arguments, function(obj) {
            if (obj && obj !== dst) {
              angular.forEach(obj, function(value, key) {
                if (dst[key] && dst[key].constructor && dst[key].constructor === Object) {
                  merge(dst[key], value);
                } else {
                  dst[key] = value;
                }
              });
            }
          });
          return dst;
        },


        processEvents: function (chart, scope) {
          function maybeAddListener(object, args) {
            if (!object) {
              return;
            }

            angular.forEach(args, function (name) {
              if (object[name]) {
                object.dispatch.on(name + '.directive', function () {
                  var args = Array.prototype.slice.call(arguments);
                  args.unshift(name + '.directive');
                  scope.$emit.call(scope, args);
                });
              }
            });
          }

          maybeAddListener(chart.dispatch && chart, [ 'tooltipShow', 'tooltipHide', 'beforeUpdate', 'stateChange', 'changeState' ]);
          maybeAddListener(chart.lines, [ 'elementMouseover.tooltip', 'elementMouseout.tooltip', 'elementClick' ]);
          maybeAddListener(chart.stacked && chart.stacked.dispatch && chart.stacked, [ 'areaClick.toggle', 'tooltipShow', 'tooltipHide' ]);

          if (chart.interactiveLayer) {
            maybeAddListener(chart.interactiveLayer.elementMouseout && chart.interactiveLayer, [ 'elementMouseout' ]);
            maybeAddListener(chart.interactiveLayer.elementMousemove && chart.interactiveLayer, [ 'elementMousemove' ]);
          }

          // this adds elementClick for scatter and bullet - not sure if it is ok
          angular.forEach(['discretebar', 'multibar', 'pie', 'scatter', 'bullet' ],
              function (element) {
                maybeAddListener(chart[element], [ 'elementMouseover.tooltip', 'elementMouseout.tooltip', 'elementClick' ]);
              });

          maybeAddListener(chart.legend, [ 'stateChange.legend', 'legendClick', 'legendDblclick', 'legendMouseover' ]);
          maybeAddListener(chart.controls && chart.controls.legendClick && chart.controls, [ 'legendClick' ]);
        },


        checkElementID: function (scope, attrs, element, chart, data) {
          this.processEvents(chart, scope);

          var svgElem = element.find('svg')[0];

          if (angular.isArray(data) && data.length === 0) {
            d3.select(svgElem).remove();
          }
          if (d3.select(svgElem).empty()) {
            d3.select(element)
                .append('svg');
          }

          if (scope.opts.width && scope.opts.height) {
            d3.select(svgElem)
                .attr('viewBox', '0 0 ' + scope.opts.width + ' ' + scope.opts.height);
          }

          d3.select(svgElem)
              .datum(data)
              .transition().duration((attrs.transitionduration === undefined ? 250 : (+attrs.transitionduration)))
              .call(chart);
        },


        updateDimensions: function (scope, attrs, element, chart) {
          if (chart) {
            if (scope.opts.width && scope.opts.height) {
              chart.width(scope.opts.width).height(scope.opts.height);
            }
            var d3Select = this.getD3Selector(attrs, element);
            if (scope.opts.width && scope.opts.height) {
              d3.select(d3Select + ' svg')
                  .attr('viewBox', '0 0 ' + scope.opts.width + ' ' + scope.opts.height);
            }
            nv.utils.windowResize(chart);
            scope.chart.update();
          }
        }
      };

      return nvd3Helpers;
    })());
