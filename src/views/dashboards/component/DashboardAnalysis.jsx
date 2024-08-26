import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { useSelector } from 'react-redux';

const DashboardAnalysis = ({ submittedRequests, qaRequests, completedRequests, inProgressRequests }) => {
  const { themeValues } = useSelector((state) => state.settings);
  const chartContainer = useRef(null);

  const LegendLabels = React.useMemo(() => {
    return {
      font: {
        size: 14,
        family: themeValues.font,
      },
      padding: 20,
      usePointStyle: true,
      boxWidth: 10,
    };
  }, [themeValues]);

  const submittedProjectNames = submittedRequests.map(request => request.project_name);
  const inProgressProjectNames = inProgressRequests.map(request => request.project_name);
  const completedProjectNames = completedRequests.map(request => request.project_name);
  const qaProjectNames = qaRequests.map(request => request.project_name);

  // Calculate counts
  const submittedCount = submittedRequests.length;
  const inProgressCount = inProgressRequests.length;
  const completedCount = completedRequests.length;
  const qaCount = qaRequests.length;

  const data = React.useMemo(() => {
    return {
      labels: ['Submitted', 'In Progress', 'Completed', 'QA'], // Statuses on the x-axis
      datasets: [
        {
          label: 'Project Status',
          borderColor: themeValues.primary,
          backgroundColor: `rgba(${themeValues.primaryrgb},0.1)`,
          data: [submittedCount, inProgressCount, completedCount, qaCount],
        },
      ],
    };
  }, [submittedCount, inProgressCount, completedCount, qaCount, themeValues]);

  const config = React.useMemo(() => {
    return {
      type: 'bar',
      options: {
        indexAxis: 'x', // Statuses on the x-axis
        elements: {
          bar: {
            borderWidth: 1.5,
          },
        },
        plugins: {
          crosshair: false,
          datalabels: false,
          legend: {
            position: 'bottom',
            labels: LegendLabels,
          },
          tooltip: {
            enabled: true,
            position: 'nearest',
            backgroundColor: themeValues.foreground,
            titleColor: themeValues.primary,
            titleFont: themeValues.font,
            bodyColor: themeValues.body,
            bodyFont: themeValues.font,
            bodySpacing: 10,
            padding: 15,
            borderColor: themeValues.separator,
            borderWidth: 1,
            cornerRadius: parseInt(themeValues.borderRadiusMd, 10),
            displayColors: false,
            intersect: true,
            mode: 'point',
            callbacks: {
              label: (context) => {
                const index = context.dataIndex;
                const count = context.raw; // Access the raw count value
                const projectNames = [
                  submittedProjectNames,
                  inProgressProjectNames,
                  completedProjectNames,
                  qaProjectNames
                ][index];
                return `${projectNames.join(', ')}`;
              }
            }
          },
          streaming: false,
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              display: false,
              drawBorder: false,
            },
          },
          y: {
            grid: {
              display: true,
              lineWidth: 1,
              color: themeValues.separatorLight,
              drawBorder: false,
            },
            ticks: {
              stepSize: 1, // Ensure only integers are displayed on y-axis
              padding: 8,
              fontColor: themeValues.alternate,
            },
          },
        },
      },
      data,
    };
  }, [data, LegendLabels, themeValues, submittedProjectNames, inProgressProjectNames, completedProjectNames, qaProjectNames]);

  useEffect(() => {
    let myChart = null;
    if (chartContainer && chartContainer.current) {
      Chart.register(...registerables);
      myChart = new Chart(chartContainer.current, config);
    }
    return () => {
      if (myChart) {
        myChart.destroy();
      }
    };
  }, [submittedRequests, qaRequests, completedRequests, inProgressRequests]);

  return <canvas ref={chartContainer} />;
};

export default DashboardAnalysis;
