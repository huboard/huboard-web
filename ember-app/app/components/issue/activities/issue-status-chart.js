import Chart from 'ember-c3/components/c3-chart';

var IssueStatusChart = Chart.extend({
  interaction: {
    enabled: false
  },
  color: {
    pattern:["#f9646e","#f9646e","#cea61b", "#7965cc"]
  },
  axis: {
    x: { show: false },
    y: { show: false }
  },
  donut: {
    width: 5,
    label: { show: false },
    expand: false
  },
  padding: {
    top: 0, right: 0, bottom: -5, left: 0
  },
  size: {
    height:45,
    width: 45 
  },
  legend: {
    show: false
  },
  tooltip: {
    show: false
  }
});

export default IssueStatusChart;
