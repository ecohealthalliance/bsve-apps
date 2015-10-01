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
        $.ajax({
            method: "POST",
            url: "https://grits-dev.ecohealth.io/api/v1/bsve/search",
            data: JSON.stringify(params)
        }).then(function(resp){
            plotChart(resp.results);
            $('h3.msg').hide();
            $('#container').fadeIn();
        });
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
            dataSource: 'PON',
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
        console.log(chartData);
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
                                var $output = $('<div>');
                                $output.append(
                                    $('<a href="#">')
                                        .text('back')
                                        .click(function(){
                                            plotChart(results);
                                        }),
                                    $('<ul>').append(
                                        this.results.map(function(result){
                                            return $('<li>').html(
                                                '<pre>' +
                                                JSON.stringify(result, 0, 2) +
                                                '</pre>'
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