BSVE.init(function()
{
    Handlebars.registerHelper('toLocaleDateString', function(date) {
        return (new Date(parseInt(date, 10))).toLocaleDateString();
    });
    var detailViewTemplate = Handlebars.compile(
        $("#detail-view-template").html()
    );

    BSVE.api.search.submit(function(query)
    {
        if(!query.term) {
            return $('h3.msg').html('A query term is required');
        }
        $('#container').hide().html('');
        var params = {
            term: query.term
        };
        if(query.startDate) params.fromDate = query.startDate;
        if(query.endDate) params.toDate = query.endDate;
        if(query.locations.length > 0) {
            params.locations = query.locations.map(function(lob){
                return {
                    location: lob.location,
                    locationType: lob.locationType
                };
            });
        }
        $.ajax({
            method: "POST",
            url: "https://grits-dev.ecohealthalliance.org/api/v1/bsve/search",
            data: JSON.stringify(params)
        }).done(function(resp){
            if(resp.results.length === 0) {
                return $('h3.msg').html('No results found for this query. Please try another query').show();
            }
            plotChart(resp.results);
            $('h3.msg').hide();
            $('#container').fadeIn();
        }).fail(function(resp){
            $('h3.msg').html('There was an error processing your request. Please try again later.').show();
        });
    }, false, false, false);

    Highcharts.getOptions().colors = Highcharts.map(Highcharts.getOptions().colors, function (color)
    {
        return {
            radialGradient: { cx: 0.5, cy: 0.3, r: 0.7 },
            stops: [
                [0, color],
                [1, Highcharts.Color(color).brighten(-0.3).get('rgb')] // darken
            ]
        };
    });

    function plotChart(results)
    {
        var resultsByClass = {};
        for ( var i = 0; i < results.length; i++ ) {
            var result = results[i];
            var classification = result.data.What;
            if(classification) {
                resultsByClass[classification] = (resultsByClass[classification] || []).concat([result]);
            }
        }
        var chartData = [];
        for ( var classification in resultsByClass ) {
            chartData.push({
                name: classification,
                y: resultsByClass[classification].length,
                results: resultsByClass[classification]
            });
        }
        chartData.sort(function(a, b){
            return b.y - a.y;
        });
        $('#container').highcharts({
            chart: {
                type: 'bar'
            },
            title: {
                text: 'Disease Classifications'
            },
            xAxis: {
                categories: chartData.map(function(item){ return item.name; })
            },
            yAxis: {
                minTickInterval: 1
            },
            legend: {
            	enabled: false
            },
            plotOptions: {
                series: {
                    cursor: 'pointer',
                    point: {
                        events: {
                            click: function () {
                                $('#container').html(
                                    detailViewTemplate({
                                        results: this.results
                                    })
                                );
                                $('#container')
                                    .find("#back-btn")
                                    .click(function(){
                                        plotChart(results);
                                    });
                            }
                        }
                    }
                }
            },
            series: [{
                name: 'Count',
                data: chartData
            }],
            credits: {
                enabled: false
            }
        });
    }
});