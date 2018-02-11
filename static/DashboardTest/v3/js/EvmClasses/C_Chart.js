console.log("C_Chart.js 2");


window.EvmClasses.Chart = class extends window.EvmClasses.ChartTemplate {
  constructor(args) {
    if(!args) args = { };
    super(args);
  }

  get DefaultChartOptions()  {
    let series = [];
    let plotOptions = {
      column: {
        stacking: 'normal',
        dataGrouping: {
          groupPixelWidth: 10
        },
        connectNulls: false,
        pointPadding: 0,
        borderWidth: 1,
        groupPadding: 0
      },
      area: {
        stacking: 'normal',
        dataGrouping: {
          groupPixelWidth: 10
        },
        connectNulls: false
      },
      line: {
        dataGrouping: {
          groupPixelWidth: 3
        },
        connectNulls: false
      },
      series: {
        dataGrouping: {
          approximation: window.EvmClasses.Chart.getApproximation,
          connectNulls: false
        },
        connectNulls: false,
        states: {
          hover: {
            enabled: false
          }
        }
      }
    };

    let chartOptions =
    {
      credits: {
        enabled: false
      },
      plotOptions,
      exporting: {
        enabled: false
      },
      series: series,
      title: { text:  ""},
      yAxis: {
        title: {
          text: ""
        },
        visible: false,
        gridLineColor: 'transparent',
        opposite:false
      },
      xAxis: {
        visible: false,
        ordinal: false,
        startOnTick: false,
        endOnTick: false,
        minRange: 0,
        crosshair: {
          snap: false
        },
        events: {
          setExtremes: window.EvmClasses.Chart.syncExtremes,
          afterSetExtremes: window.EvmClasses.Chart.afterSetExtremes
        },
        minorGridLineWidth: 0
      },
      legend: {
        enabled: false
      },
      scrollbar: {
        enabled: false
      },
      tooltip: {
        useHTML: false,
        shared: true,
        split: false,
        style: {
            zIndex: 999,
            "z-index": 999
        },
        // headerFormat: '<span style="font-size: 10px">{point.key}</span><br/>',
        // pointFormat: '<span style="color:{point.color}">●</span> {series.name}: <b>{point.y:.2f}</b><br/>',
        // footerFormat: '',
        valueDecimals: 2,
        positioner: function(boxWidth, boxHeight, point){
          let offsetHeight = window.EvmClasses.ContainerEl.offsetHeight;
          let chartHeight = this.chart.chartHeight;
          let y = offsetHeight - chartHeight;
          return {x: point.plotX + 10, y: 0};
        },
        enabled: true
      },
      chart: {
        zoomType: "x",
        marginBottom: 0,
        resetZoomButton: {
          position: {
            x: -80,
            y: 0
          },
          theme: {
              display: 'none'
          }
        }
      },
      rangeSelector : {
        enabled: false
      },
      navigator: {
        enabled: false
      }
    };

    return chartOptions;
  }


  drawChart()
  {
    super.drawChart();
    this.ElContainer.classList.add("chartContainer");
    this.ChartObj.hideLoading();
  }

  callbackUpdate(message)
  {
    super.callbackUpdate(message);

    switch (message) {
      case "Updated Times":
        //console.trace("callbackUpdate");
        window.EvmClasses.Chart.zoomAtStartEnd(this.ChartObj);
        break;
      case "Updated Metrics":
        if(window.EvmClasses.TimeRange !== "timepicker")
        {
          window.EvmClasses.TimeEnd = Date.now();
        }
        this.redrawChart();
        break;
    }
  }

  redrawChart()
  {
    super.redrawChart();
    this.ElContainer.classList.add("chartContainer");
    console.log("window.EvmClasses.TimeRange    ", window.EvmClasses.TimeRange);
    console.log("window.EvmClasses.TimeStart    ", window.EvmClasses.TimeStart);
    console.log("window.EvmClasses.TimeStart New", Date.now());

    window.EvmClasses.ChartTemplate.zoomAtStartEnd(this.ChartObj, false);
  }

  addGraph(chartOptions)
  {
    super.addGraph(chartOptions);

    //console.log("addGraph Chart.js", JSON.parse( JSON.stringify( chartOptions ) ) );

    let chart = new Highcharts.stockChart(this.ElContainer, chartOptions, (chartObj) => {
      this.ChartObj = chartObj;
      this.ChartObj.setSize(null, null, false);
      window.EvmClasses.ChartTemplate.zoomAtStartEnd(chartObj);
    });

    return chart;
  }
}
