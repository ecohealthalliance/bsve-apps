BSVE.init(function()
{
     BSVE.api.exchange.receive(function(data)
     {  
        var gritsFrame = $('#grits')[0].contentWindow;
        var link = data.Link || data.link;
        var content = data.Content || data.content;
        
        var searchPattern = new RegExp('^(Unable to extract content|Loading full article|false)');
        if (searchPattern.test(content)) {
          content = '';
        }
 
        console.log(">Content: " + content);
        console.log(">Link:" + link);

        var obj = {
          'content': content,
          'link': link
        }

        gritsFrame.postMessage( JSON.stringify(obj), "https://grits-dev.ecohealthalliance.org");
     });
});