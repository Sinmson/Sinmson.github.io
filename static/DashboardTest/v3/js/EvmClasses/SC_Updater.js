console.log("SC_Updater");

if(window.EvmClasses)
{
  console.log("EvmClasses do exist");
}
else
{
  console.log("EvmClasses do not exist");
}

window.EvmClasses.Updater = {
  observers: [], //beobachter
  metrics: [],
  dialogMetrics: [],
  smIds: [],
  smIdsData: [],
  interval: null,
  addObserver(smIds, metrics, observer, isDialog) {
    this.observers.push(observer);

    this.addMetrics(JSON.parse(JSON.stringify(metrics)), isDialog);
    this.addSmIds(JSON.parse(JSON.stringify(smIds)));

    if(this.interval == null)
    {
      this.start();
    }

    return observer.Id;
  },
  subscribe(observer, isDialog) {
    console.log("subscribe", observer, isDialog);
    let smIds = [];
    let metrics = [];
    if("SmIds" in observer)
    {
      smIds = observer.SmIds;
    }
    if("Metrics" in observer)
    {
      metrics = observer.Metrics;
    }

    let index = this.observers.findIndex( obs => obs.Id == observer.Id);
    if(index >= 0)
    {
      this.addSmIds(smIds);
      this.addMetrics(metrics, isDialog);
      return this.observers[index].Id;
    }

    return this.addObserver(smIds, metrics, observer);
  },
  removeObserver(id, isDialog) {
    //console.log("removeObserver", id);
    let index = this.observers.findIndex( obs => obs.Id == id);
    if(index >= 0)
    {
      let observer = this.observers[index];

      if(observer.Metrics)
      {
        this.removeMetrics(observer.Metrics, isDialog);
      }
      this.observers.splice(index, 1 );
      return true;
    }
    else
    {
      return false;
    }
  },
  notifyObservers(message) {
    for(let observer of this.observers)
    {
      observer.callbackUpdate(message);
    }
  },
  removeMetrics(metrics, isDialog) {
    console.log("removeMetrics", metrics, isDialog);
    for (var i = 0; i < metrics.length; i++)
    {
      let metric = metrics[i];

      let index = this.metrics.findIndex( m => m.id == metric.id);
      if(isDialog)
      {
        index = this.dialogMetrics.findIndex( m => m.id == metric.id);
      }

      if(index >= 0)
      {
        if(isDialog)
        {
          this.dialogMetrics.splice(index,1);
        }
        else
        {
          this.metrics[index].disabled = true;
        }
      }
    }
  },
  addMetrics(metrics, isDialog) {
    //console.log("push metrics metrics", JSON.parse( JSON.stringify( this.metrics  )));
    //console.log("push metrics", metrics);
    for (var i = 0; i < metrics.length; i++)
    {
      let metric = metrics[i];
      let index = this.metrics.findIndex(m => m.id == metric.id);
      if(isDialog)
      {
        index = this.dialogMetrics.findIndex( m => m.id == metric.id);
      }
      if(index < 0)
      {
        if(isDialog)
        {
          this.dialogMetrics.push(metric);
        }
        else
        {
          this.metrics.push(metric);
        }
      }
      else
      {
        if(isDialog)
        {
          this.dialogMetrics[index].disabled = false;
        }
        else
        {
          this.metrics[index].disabled = false;
        }
      }
    }
  },
  addSmIds(smIds) {
    //console.log("push smIds", smIds);
    for (var i = 0; i < smIds.length; i++)
    {
      let smId = smIds[i];

      if(this.smIds.indexOf(smId) < 0)
      {
        this.smIds.push(smId);
      }
    }
  },
  start() {

    //TODO: Sperrflag?
    setTimeout( () => {
      this.upgradeMetricsInTimeRangeAndNotify();
      this.updateAndNotifyStatus();
    }, 500);


    this.interval = setInterval( () => {
      // this.upgradeMetricsTowardsFutureAndNotify();
      this.upgradeMetricsAndDialogTowardsFutureAndNotify();
      this.updateAndNotifyStatus();
    }, 300000);
  },
  updateAndNotifyStatus()  {
    /*this.updateSmIdsPromise()
    .then( data => {
      for (let dat of data)
      {
        this.smIdsData[dat.id] = dat;
      }
      this.notifyObservers("Updated SmIds");
    } )
    .catch(err => {
      alert("A problem got catched while updating the status of your charts.\n\nPlease make sure that you have an working intranet connection and VSM is reachable!!!\n\n\nError:\n" + err.toString());
    });*/
  },
  updateAndNotifyMetrics(isDialog)  {
    this.upgradeMetricsTowardsFutureAndNotify(this.metrics, isDialog);
  },
  refreshMetricsFromDatasets(datasets, addInsteadOfReplace, isDialog) {
    let length = isDialog ? this.dialogMetrics.length : this.metrics.length;
    console.log("refreshMetricsFromDatasets", datasets, length);
    for (var i = 0; i < length; i++)
    {
      let metric = this.metrics[i];
      if(isDialog)
      {
        metric = this.dialogMetrics[i];
      }
      let datasetsForMetric = datasets.filter( datasetMetric => metric.id == +datasetMetric.METRICID);

      console.log("datasetsForMetric", datasetsForMetric);

      if(addInsteadOfReplace)
      {
        let newDatasets = datasetsForMetric.filter(d => metric.data.findIndex(md => +d.START == md.START) < 0);
        // console.log("i", i);
        // console.trace("newDatasets", newDatasets);
        for (var j = 0; j < newDatasets.length; j++)
        {
          metric.data.push(newDatasets[j]);
        }
      }
      else
      {
        metric.data = datasetsForMetric;
      }


      if(isDialog)
      {
        if(this.dialogMetrics[i].data)
        {
          this.dialogMetrics[i].data = this.dialogMetrics[i].data.sort((d1, d2) => new Date(+d1.START) - new Date(+d2.START) );
        }
      }
      else
      {
        if(this.metrics[i].data)
        {
          this.metrics[i].data = this.metrics[i].data.sort((d1, d2) => new Date(+d1.START) - new Date(+d2.START) );
        }
      }

    }
  },
  updateAndNotify() {
    this.updateAndNotifyStatus();
    this.updateAndNotifyMetrics();
  },
  notifyAboutUpdatedMetrics(isDialog)
  {
    if(isDialog)
    {
      console.trace("Updated DialogMetrics");
      this.notifyObservers("Updated DialogMetrics");
    }
    else
    {
      this.notifyObservers("Updated Metrics");
    }
  },
  updateSmIdsPromise() {
    let promises = [];
    for (let smId of this.smIds)
    {
      promises.push(this.loadSmIdState(smId));
    }

    return Promise.all(promises);
  },
  xhrRequestPromise(args)  {
    return new Promise((resolve, reject) => {
      let str = "";
      for (let key of Object.keys(args.data)) {
        if (str != "") {
            str += "&";
        }
        str += key + "=" + args.data[key];
      }
      let xhr = new XMLHttpRequest();
      // xhr.withCredentials = true;
      xhr.open(args.method || "GET", (args.method.toUpperCase() != "GET".toUpperCase()) ? args.url : args.url+ "?" + str , args.async ? true : false, args.user || null, args.password || null);
      if (args.headers) {
          Object.keys(args.headers).forEach(key => {
              xhr.setRequestHeader(key, args.headers[key]);
          });
      }

      xhr.responseType = (args.responseType || 'text');
      xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
              resolve(xhr.response);
          } else {
              reject(xhr.statusText);
          }
      };
      xhr.onerror = () => reject(xhr.statusText);
      xhr.send(args.body || args.data || null);
    });
  },
  loadSmIdState(smId)  {
    /*return this.xhrRequestPromise({
      url: "/centauri/MainServlet/templates/stylesheets/custom/XMLCalls/dynamic/currentState2.json",
      method: "GET",
      async: true,
      responseType: "json",
      data: {
        SM_ID: smId
      }
    })*/
  },
  loadMetricsPromise(metrics, start, end, timeInterval)  {
    window.EvmClasses.chartStartLoading();
    let metricIds = [];


    for(let metric of metrics)
    {
      if(metric.disabled != true)
      {
        metricIds.push(metric.id);
      }
    }

    if(start.toString().length == 13) //Check if number is in milliseconds
      start         = Math.round(start / 1000);
    if(end.toString().length == 13) //Check if number is in milliseconds
      end           = Math.round(end / 1000);

    if(timeInterval != "auto")
    {
      timeInterval  = Math.round(timeInterval / 1000);
    }

    let uris = {};
    // uris.fiveMinutly = "/centauri/MainServlet/templates/stylesheets/custom/XMLCalls/dynamic/RawMetricValues5min1.json";
    // uris.hourly = "/centauri/MainServlet/templates/stylesheets/custom/XMLCalls/dynamic/RawMetricValuesHourly.json";
    // uris.daily = "/centauri/MainServlet/templates/stylesheets/custom/XMLCalls/dynamic/RawMetricValuesDaily.json";
    // uris.monthly = "/centauri/MainServlet/templates/stylesheets/custom/XMLCalls/dynamic/RawMetricValuesMonthly.json";
    uris.fiveMinutly = "http://localhost:9000/api/RawMetricValues_5min";
    uris.hourly = "http://localhost:9000/api/RawMetricValues_Hourly";
    uris.daily = "http://localhost:9000/api/RawMetricValues_Daily";
    uris.monthly = "http://localhost:9000/api/RawMetricValues_Monthly";

    let uriToRequest = uris.fiveMinutly;
    if(timeInterval >= 3600)  //1 Hour
      uriToRequest = uris.hourly;
    if(timeInterval >= 86400) //1 Day
      uriToRequest = uris.daily;

    //TODO: FIX QuickNDirty
    if(timeInterval == "auto")
    {
      if((end - start) >= (2 * 86400))  //2+ Days
        uriToRequest = uris.hourly;
      if((end - start) >= (8 * 86400)) //8+ Days
        uriToRequest = uris.daily;
    }

    return this.xhrRequestPromise(
      {
        method: "GET",
        url : uriToRequest,
        responseType: "json",
        async: true,
        data:
        {
          timestart : start,
          timeend : end,
          metricids : metricIds.join(",")
        }
      }
    )
  },
  upgradeMetricsTowardsPastAndNotify(metrics, isDialog) {
    let start = isDialog ? window.EvmClasses.Dialog.TimeStart : window.EvmClasses.TimeStart;
    let end = metrics ?  this.getMetricsTimes(isDialog, metrics).startTimes.latest : this.getMetricsTimes(isDialog).startTimes.latest;
    let intervalMillis = isDialog ? window.EvmClasses.Dialog.TimeInterval : window.EvmClasses.TimeInterval;

    if(start == end)
    {
      end = isDialog ? window.EvmClasses.Dialog.TimeEnd : window.EvmClasses.TimeEnd;
    }

    if(metrics)
    {
      this.loadMetricsPromise(metrics, start, end, intervalMillis)
      .then( datasets => {
        this.refreshMetricsFromDatasets(datasets, true, isDialog);
        this.notifyAboutUpdatedMetrics(isDialog);
      });
    }
    else
    {
      this.loadMetricsPromise(this.metrics, start, end, intervalMillis)
      .then( datasets => {
        this.refreshMetricsFromDatasets(datasets, true, isDialog);
        this.notifyAboutUpdatedMetrics(isDialog);
      });
    }
  },
  upgradeMetricsTowardsPresentAndNotify(metrics, isDialog) {
    let start = metrics ? this.getMetricsTimes(isDialog, metrics).endTimes.earliest : this.getMetricsTimes(isDialog).endTimes.earliest;
    let end = isDialog ? window.EvmClasses.Dialog.TimeEnd : window.EvmClasses.TimeEnd;
    let intervalMillis = isDialog ? window.EvmClasses.Dialog.TimeInterval : window.EvmClasses.TimeInterval;

    if(start == end)
    {
      start = isDialog ? window.EvmClasses.Dialog.TimeStart : window.EvmClasses.TimeStart;
    }

    if(metrics)
    {
      this.loadMetricsPromise(metrics, start, end, intervalMillis)
      .then( datasets => {
        this.refreshMetricsFromDatasets(datasets, true), isDialog;
        this.notifyAboutUpdatedMetrics(isDialog);
      });
    }
    else
    {
      this.loadMetricsPromise(this.metrics, start, end, intervalMillis)
      .then( datasets => {
        this.refreshMetricsFromDatasets(datasets, true, isDialog);
        this.notifyAboutUpdatedMetrics(isDialog);
      });
    }
  },
  upgradeMetricsAndDialogTowardsFutureAndNotify()
  {
    console.log("upgradeMetricsAndDialogTowardsFutureAndNotify");
    this.upgradeMetricsTowardsFutureAndNotify(this.metrics, false);
    this.upgradeMetricsTowardsFutureAndNotify(this.dialogMetrics, true);
  },
  upgradeMetricsTowardsFutureAndNotify(metrics, isDialog) {
    console.log("upgradeMetricsTowardsFutureAndNotify", isDialog, metrics);
    let start = this.getMetricsTimes(isDialog).endTimes.earliest;
    let end = Date.now();
    let intervalMillis = isDialog ? window.EvmClasses.Dialog.TimeInterval : window.EvmClasses.TimeInterval;

    if(metrics)
    {
      start = this.getMetricsTimes(isDialog, metrics).endTimes.earliest;
      this.loadMetricsPromise(metrics, start, end, intervalMillis)
      .then( datasets => {
        this.refreshMetricsFromDatasets(datasets, true, isDialog);
        this.notifyAboutUpdatedMetrics(isDialog);
      });
    }
    else
    {
      this.loadMetricsPromise(this.metrics, start, end, intervalMillis)
      .then( datasets => {
        this.refreshMetricsFromDatasets(datasets, true, isDialog);
        this.notifyAboutUpdatedMetrics(isDialog);
      });
    }
  },
  upgradeMetricsInTimeRangeAndNotify(metrics, isDialog)  {
    let start = isDialog ? window.EvmClasses.Dialog.TimeStart : window.EvmClasses.TimeStart;
    let end = isDialog ? window.EvmClasses.Dialog.TimeEnd : window.EvmClasses.TimeEnd;
    let intervalMillis = isDialog ? window.EvmClasses.Dialog.TimeInterval : window.EvmClasses.TimeInterval;

    start = Math.round(start);
    end = Math.round(end);





    if(metrics)
    {
      this.loadMetricsPromise(metrics, start, end, intervalMillis)
      .then( datasets => {
        this.refreshMetricsFromDatasets(datasets, false, isDialog);
        this.notifyAboutUpdatedMetrics(isDialog);
      });
    }
    else
    {
      this.loadMetricsPromise(this.metrics, start, end, intervalMillis)
      .then( datasets => {
        this.refreshMetricsFromDatasets(datasets, false, isDialog);
        this.notifyAboutUpdatedMetrics(isDialog);
      });
    }
  },

  getMetricsTimes(isDialog, metrics) {
    let metricsEndTime = {
      latest: false,
      earliest: false
    };

    let metricsStartTime = {
      latest: false,
      earliest: false
    };

    let metricsToLoop = [];

    if(metrics)
    {
      metricsToLoop = metrics;
    }
    else
    {
      metricsToLoop = isDialog ? this.dialogMetrics : this.metrics;
    }

    for (var i = 0; i < metricsToLoop.length; i++)
    {
      let metric = metricsToLoop[i];

      if(metric.data && metric.data.length > 2)
      {
        let validData = metric.data.filter( d => d.SUM_VALUE != null);
        if(validData.length > 0)
        {
          if(!metricsEndTime.earliest || validData[validData.length-1].START < metricsEndTime.earliest)//Take the earliest of the latest timestamps
          {
            metricsEndTime.earliest = +validData[validData.length-1].START;
          }
          if(!metricsEndTime.latest || validData[validData.length-1].START > metricsEndTime.latest)
          {
            metricsEndTime.latest = +validData[validData.length-1].START;
          }

          if(!metricsStartTime.earliest || validData[0].START < metricsStartTime.earliest)//Take the earliest of the latest timestamps
          {
            metricsStartTime.earliest = +validData[0].START;
          }
          if(!metricsStartTime.latest || validData[0].START > metricsStartTime.latest)
          {
            metricsStartTime.latest = +validData[0].START;
          }
        }
      }
      else
      {
        metricsEndTime.earliest = window.EvmClasses.TimeEnd;
        metricsEndTime.latest = window.EvmClasses.TimeEnd;
        metricsStartTime.earliest = window.EvmClasses.TimeStart;
        metricsStartTime.latest = window.EvmClasses.TimeStart;
      }
    }

    let retVal = {
      endTimes: metricsEndTime,
      startTimes: metricsStartTime
    };


    return retVal;
  },
  forceUpdateMetrics(metrics) {
    if(metrics)
    {
      this.upgradeMetricsTowardsFutureAndNotify(metrics);
    }
    else
    {
      this.updateAndNotifyMetrics();
    }
  }
}
