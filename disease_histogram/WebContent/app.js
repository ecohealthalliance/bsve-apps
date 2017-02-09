var GRITS_URL = "https://grits.bsvecosystem.net";
BSVE.init(function()
{
    var reqId = null,
        _title;

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
        params.auth_ticket = BSVE.api.authTicket();
        $('h3.msg').html('Analyzing search results...').show();
        $.ajax({
            method: "POST",
            url: GRITS_URL + "/api/v1/bsve/search_and_diagnose",
            data: JSON.stringify(params)
        }).then(function(resp){
            plotChart(resp.results);
            $('h3.msg').hide();
            $('#container').fadeIn();
        }).fail(onError);
    }, false, false, false);

    function onComplete(response)
    {
        if ( response.status == 0 )
        {
            setTimeout(function(){ BSVE.api.datasource.result(reqId, onComplete, onError); }, 500);
        }
        else if (response.status == -1)
        {
            onError(response);
        }
        else
        {
            var _ponResults = response.result;
            if ( _ponResults.length )
            {
                plotChart(_ponResults);
                $('h3.msg').hide();
                $('#container').fadeIn();
            }
            else
            {
                $('h3.msg').html('No results found for this query. Please try another query').show();
            }
        }
    }

    function onError(response)
    {
        $('h3.msg').html('There was an error processing your request. Please try again later.').show();
    }

    BSVE.ui.dossierbar.create(function(status)
    {
        var svg = new XMLSerializer().serializeToString( $('svg')[0] ),
        canvas = document.createElement('canvas'),
        img = new Image();

        canvg(canvas, svg);
        img.src = canvas.toDataURL();
        var item = {
            dataSource: 'GRITS',
            title: _title,
            sourceDate: BSVE.api.dates.yymmdd(Date.now()),
            itemDetail: {
                statusIconType: 'Graph',
                Description: img.outerHTML
            }
        }
 
        BSVE.api.tagItem(item, status);
    });

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
            if(result.diagnosis && result.diagnosis.diseases) {
                result.diagnosis.diseases.forEach(function(disease){
                    resultsByClass[disease.name] = (resultsByClass[disease.name] || []).concat([result]);
                });
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
        var $content = $('<div>');
        $content.append(
            $('<div id="chart">')
        );
        $('#container').html($content);
        $('#chart').highcharts({
            chart: {
                type: 'bar'
            },
            title: {
                text: 'GRITS Disease Classifications'
            },
            subtitle: {
                text: 'This shows classifications for the first 200 search results.<br/>'+
                    'Articles may have multiple classifications.'
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
                                var $output = $('<div id="results">');
                                $output.append(
                                    $('<p>').append(
                                        $('<a href="#">')
                                            .text('Go back to histogram')
                                            .click(function(){
                                                plotChart(results);
                                            })
                                    ),
                                    $('<h3>').text(this.name + ' Articles'),
                                    '<hr>',
                                    $('<ul>').append(
                                        this.results.map(function(result){
                                            return $('<li>').html(
                                                '<a href="'+ result.data.Link + '" target="_blank">' +
                                                result.data.Title +
                                                '</a>'
                                            );
                                        })
                                    )
                                );
                                $('#container').html($output);
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
