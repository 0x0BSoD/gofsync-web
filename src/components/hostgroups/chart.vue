<script>
    import { Line } from 'vue-chartjs'
    import { Common } from "../../views/methods";

    export default {
        extends: Line,
        props: {
            chartData: {
                type: Array | Object,
                required: false
            },
        },
        data () {
            return {
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                            },
                            gridLines: {
                                display: true
                            }
                        }],
                        xAxes: [ {
                            display: true,
                            gridLines: {
                                display: false
                            }
                        }]
                    },
                    legend: {
                        display: true
                    },
                    responsive: true,
                    maintainAspectRatio: false
                }
            }
        },
        mounted () {
            this.gradient = this.$refs.canvas.getContext('2d').createLinearGradient(0, 0, 0, 450);
            this.gradient.addColorStop(0, 'rgba(255, 0,0, 0.5)');
            this.gradient.addColorStop(0.5, 'rgba(255, 0, 0, 0.25)');
            this.gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

            let labels = [];
            let values = [];


            for (let i in this.chartData) {
                labels.push(i);
            }


            for (let i in labels) {
                values.push(this.chartData[i]);
            }

            this.renderChart({
                labels: labels,
                datasets: [{
                    label: "Puppet runs last 24h",
                    borderColor: '#f87979',
                    pointBackgroundColor: 'white',
                    borderWidth: 1,
                    radius: 0.5,
                    pointBorderColor: '#f87979',
                    backgroundColor: this.gradient,
                    data: values
                }]
            }, this.options)
        },
    }
</script>
