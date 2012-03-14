	
var App = new Ext.Application({
    
    name: 'StockApp',
		icon: 'icon_sencha_touch.png',
		
    requires: [
    	'Ext.util.JSONP'
    ],
    
    launch: function () {

  		Ext.regModel('Stats', {
		    fields: [
				{ name: 'itemDescr', type: 'string' },
				{ name: 'itemValue', type: 'string' }
			]
		});
			
		Ext.regStore('StatsStore', {
			model: 'Stats',
		});
	
     StockApp.views.statsList = new Ext.List({
			id: 'statsList',
			store: 'StatsStore',
			margin: '20',
			scroll: false,
			itemTpl: '<div class="statsList">{itemDescr} <span class="ui-li-count">{itemValue}</span></div>'
		});

		StockApp.views.statsListToolbar = new Ext.Toolbar({
			id: 'statsListToolbar',
			title: 'Stock Stats',
			layout: 'hbox',
			items: [
				{ xtype: 'spacer' },
				{
					id: 'aboutButton',
					text: 'About',
					ui: 'action',
					handler: function () {

						// Basic alert:
						Ext.Msg.show({
	   						title: 'About Site',
	   						cls: 'home',
	   						msg: '<p>This mobile site is a proof-of-concept, playground, etc. for accessing Stock data.</p><p>It was built using the <a href="http://www.sencha.com/" target="foo">Sencha Touch (1.1)</a> framwork and utilizes <a href="http://developer.yahoo.com/yql/" target="foo">Yahoo! Query Language (YQL)</a> to get the last trade information</p> ',
	   						width: 500,
	   						buttons: Ext.MessageBox.OK,
	   						fn: Ext.emptyFn,
	   						midWidth: 500
						});

					}
				}
			]
		});
				
		StockApp.views.stockSearch = new Ext.form.FormPanel({
			id: 'stockSearch',
			items: [
					{
						xtype: 'fieldset',
						//title: 'Enter Stock Ticker',
						items: [
							{
							  xtype: 'textfield',
							  name : 'ticker',
							  label: 'Ticker:'
						  }
						],
					},
					{
						xtype:  'button',
						text:   'Search',
						ui:     'confirm',
						scope: 	this,
						handler: function() {
							var values = StockApp.views.stockSearch.getValues();
	  					makeYqlRequest(values.ticker);
						}
					}
	     	]
		});

    StockApp.views.statsListContainer = new Ext.Panel({
        id : 'statsListContainer',
				fullscreen: true,
				scroll: true,
        layout: {
					type: 'vbox',
					align: 'stretch'
				},
        dockedItems: [StockApp.views.statsListToolbar],
        items: [ StockApp.views.stockSearch, StockApp.views.statsList ]
    });

		StockApp.views.viewport = new Ext.Panel({
        fullscreen : true,
        layout : 'card',
        cardAnimation : 'slide',
        items: [StockApp.views.statsListContainer]
    });

	} //launch

});
        
////////////////////////////////////////////////
//Function to return a blank if a value is null.
////////////////////////////////////////////////
function valueOrDefault(val, def) {
    if (def == undefined) def = "N/A";
    return val == undefined ? def : val;
}		
		

Ext.YQL = {
	
    useAllPublicTables: true,
    yqlUrl: 'http://query.yahooapis.com/v1/public/yql',
    request: function(config) {
    
        //get the params for the request
        var params = config.params || {};
        params.q = config.query;
        params.format = 'json';

	      if (this.useAllPublicTables) {
            params.env = 'store://datatables.org/alltableswithkeys';
        }

        Ext.util.JSONP.request({
            url: this.yqlUrl,
            callbackKey: 'callback',
            params: params,
            callback: config.callback,
            scope: config.scope || window
        });
    }
};

////////////////////////////////////////////////
//Function to make the YQL call.
////////////////////////////////////////////////
function makeYqlRequest(ticker) {
	
	var queryString = "select * from yahoo.finance.quotes where symbol in ('" + ticker + "')";
       
  //make the YQL request
  Ext.YQL.request({
      
			query: queryString,

      //and give it a callback when the response comes back
      callback: function(success, response) {
          var results = [];
					
          if (success.query && success.query.results) {
              o = success.query.results.quote;
              var d = [
								{ id: 1, itemDescr : o.Name + " (" + o.Symbol + ")", itemValue: "" },
								{ id: 2, itemDescr: "Ask Price",     				itemValue: "$" + valueOrDefault(o.AskRealtime,0) },
								{ id: 3, itemDescr: "Dividend Yield",     	itemValue: valueOrDefault(o.DividendYield, 0) + "%" },
								{ id: 4, itemDescr: "Dividend per Share ",	itemValue: "$" + valueOrDefault(o.DividendShare) },
								{ id: 5, itemDescr: "Ex-Dividend Date",     itemValue: valueOrDefault(o.ExDividendDate) 	},
								{ id: 6, itemDescr: "Dividend Pay Date",    itemValue: valueOrDefault(o.DividendPayDate) 	},
								{ id: 7, itemDescr: "EPS",    							itemValue: valueOrDefault(o.EarningsShare)  	},
								{ id: 8, itemDescr: "EBITDA",    						itemValue: valueOrDefault(o.EBITDA) 	},
								{ id: 9, itemDescr: "Price/Sales",    			itemValue: valueOrDefault(o.PriceSales) 	},
								{ id: 10,itemDescr: "Price/Book ",    			itemValue: valueOrDefault(o.PriceBook) 	},
								{ id: 11,itemDescr: "Price/Earnings",  			itemValue: valueOrDefault(o.PERatio) 	},
								{ id: 12,itemDescr: "PEG ",    							itemValue: valueOrDefault(o.PEGRatio) 	},
								{ id: 13,itemDescr: "Short",    						itemValue: valueOrDefault(o.ShortRatio) 	}
								
							];
          	StockApp.views.statsList.update(d);
          }                    
      }
  });

}			 