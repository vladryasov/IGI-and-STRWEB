/**
 * Графики Chart.js для функции arccos x (Вариант 19)
 * Два графика: разложение в ряд и вычисление через math.js
 */

class ArccosChart {
    constructor() {
        this.chart = null;
        this.init();
    }

    init() {
        // Загружаем Chart.js и math.js если не загружены
        this.loadLibraries(() => {
            this.createChart();
            this.attachEventListeners();
        });
    }

    loadLibraries(callback) {
        if (typeof Chart !== 'undefined' && typeof math !== 'undefined') {
            callback();
            return;
        }

        let loaded = 0;
        const checkLoaded = () => {
            loaded++;
            if (loaded === 2) callback();
        };

        // Загружаем Chart.js
        if (typeof Chart === 'undefined') {
            const chartScript = document.createElement('script');
            chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
            chartScript.onload = checkLoaded;
            document.head.appendChild(chartScript);
        } else {
            checkLoaded();
        }

        // Загружаем math.js
        if (typeof math === 'undefined') {
            const mathScript = document.createElement('script');
            mathScript.src = 'https://cdn.jsdelivr.net/npm/mathjs@12.2.0/lib/browser/math.min.js';
            mathScript.onload = checkLoaded;
            document.head.appendChild(mathScript);
        } else {
            checkLoaded();
        }
    }

    // Вычисление arccos через разложение в ряд Тейлора
    taylorArccos(x, n = 20) {
        // arccos x = π/2 - arcsin x
        // arcsin x = Σ[(2n)!/(4^n * (n!)^2 * (2n+1)) * x^(2n+1)]
        let arcsin = 0;
        for (let i = 0; i < n; i++) {
            const numerator = this.factorial(2 * i);
            const denominator = Math.pow(4, i) * Math.pow(this.factorial(i), 2) * (2 * i + 1);
            arcsin += (numerator / denominator) * Math.pow(x, 2 * i + 1);
        }
        return Math.PI / 2 - arcsin;
    }

    factorial(n) {
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    createChart() {
        const canvas = document.getElementById('arccos-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Генерируем данные
        const minX = -1;
        const maxX = 1;
        const step = 0.1;
        const xValues = [];
        const taylorValues = [];
        const mathValues = [];

        for (let x = minX; x <= maxX; x += step) {
            xValues.push(parseFloat(x.toFixed(2)));
            
            // Значение через ряд Тейлора
            const taylorValue = this.taylorArccos(x);
            taylorValues.push(taylorValue);
            
            // Значение через math.js (если доступно)
            let mathValue = Math.acos(x);
            if (typeof math !== 'undefined' && math.acos) {
                try {
                    mathValue = math.acos(x);
                } catch (e) {
                    mathValue = Math.acos(x);
                }
            }
            mathValues.push(mathValue);
        }

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: xValues,
                datasets: [
                    {
                        label: 'arccos x (ряд Тейлора)',
                        data: taylorValues,
                        borderColor: 'rgb(255, 107, 53)',
                        backgroundColor: 'rgba(255, 107, 53, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 2,
                        pointHoverRadius: 5
                    },
                    {
                        label: 'arccos x (math.js)',
                        data: mathValues,
                        borderColor: 'rgb(74, 144, 226)',
                        backgroundColor: 'rgba(74, 144, 226, 0.1)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.4,
                        pointRadius: 2,
                        pointHoverRadius: 5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart'
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'График функции arccos x',
                        font: {
                            size: 18,
                            weight: 'bold'
                        },
                        padding: 20
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: {
                                size: 14
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(4)}`;
                            }
                        }
                    },
                    annotation: {
                        annotations: {
                            xAxis: {
                                type: 'line',
                                xMin: 0,
                                xMax: 0,
                                borderColor: 'rgb(0, 0, 0)',
                                borderWidth: 1,
                                label: {
                                    display: true,
                                    content: 'x = 0'
                                }
                            },
                            yAxis: {
                                type: 'line',
                                yMin: 0,
                                yMax: 0,
                                borderColor: 'rgb(0, 0, 0)',
                                borderWidth: 1,
                                label: {
                                    display: true,
                                    content: 'y = 0'
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'x',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'arccos x',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    attachEventListeners() {
        const saveBtn = document.getElementById('save-chart-btn');
        const rangeMinInput = document.getElementById('range-min');
        const rangeMaxInput = document.getElementById('range-max');
        const updateBtn = document.getElementById('update-range-btn');

        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveChart());
        }

        if (updateBtn) {
            updateBtn.addEventListener('click', () => {
                const min = parseFloat(rangeMinInput.value) || -1;
                const max = parseFloat(rangeMaxInput.value) || 1;
                this.updateChartRange(min, max);
            });
        }
    }

    saveChart() {
        if (!this.chart) return;

        const url = this.chart.toBase64Image('image/png', 1);
        const link = document.createElement('a');
        link.download = 'arccos-chart.png';
        link.href = url;
        link.click();
    }

    updateChartRange(min, max) {
        if (!this.chart) return;

        const step = 0.1;
        const xValues = [];
        const taylorValues = [];
        const mathValues = [];

        for (let x = min; x <= max; x += step) {
            if (x < -1 || x > 1) continue; // arccos определен только на [-1, 1]
            
            xValues.push(parseFloat(x.toFixed(2)));
            taylorValues.push(this.taylorArccos(x));
            
            let mathValue = Math.acos(x);
            if (typeof math !== 'undefined' && math.acos) {
                try {
                    mathValue = math.acos(x);
                } catch (e) {
                    mathValue = Math.acos(x);
                }
            }
            mathValues.push(mathValue);
        }

        this.chart.data.labels = xValues;
        this.chart.data.datasets[0].data = taylorValues;
        this.chart.data.datasets[1].data = mathValues;
        this.chart.update('active');
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('arccos-chart')) {
        new ArccosChart();
    }
});

