(function($) {
    /**
     * Class: $.jqplot.BoxplotRenderer
     * jqPlot Plugin to draw box plots <http://en.wikipedia.org/wiki/Box_plot>.
     * 
     * To use this plugin, include the renderer js file in 
     * your source:
     * 
     * > <script type="text/javascript" src="plugins/jqplot.boxplotRenderer.js"></script>
     * 
     * Then you set the renderer in the series options on your plot:
     * 
     * > series: [{renderer:$.jqplot.BoxplotRenderer}]
     * 
     * Data should be specified like so:
     * 
     * > dat = [[sample_id, min, q1, median, q3, max], ...]
     * 
     */
    $.jqplot.BoxplotRenderer = function(){
        // subclass line renderer to make use of some of its methods.
        $.jqplot.LineRenderer.call(this);
        // prop: boxWidth
        // Default will auto calculate based on plot width and number
        // of boxes displayed.
        this.boxWidth = 'auto';
        this._boxMaxWidth = 100; // if 'auto', cap at this max
        // prop: lineWidth
        // The thickness of all lines drawn. Default is 1.5 pixels.
        this.lineWidth = 1.5;
    };
    
    $.jqplot.BoxplotRenderer.prototype = new $.jqplot.LineRenderer();
    $.jqplot.BoxplotRenderer.prototype.constructor = $.jqplot.BoxplotRenderer;
    
    // called with scope of series.
    $.jqplot.BoxplotRenderer.prototype.init = function(options, plot) {

        plot.postDrawHooks.add($.jqplot.BoxplotRenderer.removePointerLabels);

        this.lineWidth = options.lineWidth || this.renderer.lineWidth;
        $.jqplot.LineRenderer.prototype.init.call(this, options);
        // set the yaxis data bounds here to account for high and low values
        var db = {"min" : this._yaxis.min, "max" : this._yaxis.max};
        var d = this._plotData;
        for (var j=0, dj=d[j]; j<d.length; dj=d[++j]) {
            for (var k=1, dk=dj[k]; k<dj.length; dk=dj[++k]) {
                if (dk < db.min || db.min == null)
                    db.min = dk;
                if (dk > db.max || db.max == null)
                    db.max = dk;
            }
        }
        if(this._yaxis.min==null) {
            this._yaxis.min = db.min*this._yaxis.pad;
        }
        if(this._yaxis.max==null) {
            this._yaxis.max = db.max*this._yaxis.pad;
        }
    };
    
    // called within scope of series.
    $.jqplot.BoxplotRenderer.prototype.draw = function(ctx, gd, options) {
        var d = this.data;
        var r = this.renderer;
        // set the shape renderer options
        var xp = this._xaxis.series_u2p;
        var yp = this._yaxis.series_u2p;
        if (!options)
            options = {};
        if (!('lineWidth' in options))
            $.extend(true, options, {lineWidth: this.lineWidth});
        var boxopts = $.extend(true, {}, options, {strokeRect: true});
        var boxW = options.boxWidth || r.boxWidth;
        if (boxW == 'auto')
            boxW = Math.min(r._boxMaxWidth, 0.6 * ctx.canvas.width/d.length);
        var endW = boxW / 2; // min and max ticks are half the box width
        boxW -= this.lineWidth*2;

        var sctx = this.canvas._ctx;

        ctx.save();
        if (this.show) {
            for (var i=0, di=d[i]; i<d.length; di=d[++i]) {
               var  x = xp(di[0]),
                  min = yp(di[7]),
                   q1 = yp(di[6]),
                  med = yp(di[5]),
                   q3 = yp(di[4]),
                  max = yp(di[3]);

               var endL = x - endW/2; // start (left) x coord of min/max ticks
               var endR = x + endW/2; // end (right) x coord of min/max ticks
               var medL = x - boxW/2; // start (left) x coord of median tick
               var medR = x + boxW/2; // end (right) x coord of median tick

               // median tick is full box width
               r.shapeRenderer.draw(ctx, [[medL, med], [medR, med]], options);
                
               // draw whiskers
               r.shapeRenderer.draw(ctx, [[x, min], [x, q1]], options);
               r.shapeRenderer.draw(ctx, [[x, q3], [x, max]], options);

               // draw min and max ticks
               r.shapeRenderer.draw(ctx, [[endL, min], [endR, min]], options);
               r.shapeRenderer.draw(ctx, [[endL, max], [endR, max]], options);

               // draw box
               boxH = q1 - q3;
               boxpoints = [medL, q3, boxW, boxH];
               r.shapeRenderer.draw(ctx, boxpoints, boxopts);
            }
        }
        ctx.restore();
    };
    
    $.jqplot.BoxplotRenderer.prototype.drawShadow = function(ctx, gd, options) {
        // This is a no-op, shadows drawn with lines.
    };
    
    $.jqplot.BoxplotRenderer.removePointerLabels = function() {
        $(".jqplot-point-label").each(function() {
           $(this).hide();
        });
    }
    

    
})(jQuery);
