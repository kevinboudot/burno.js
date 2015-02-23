(function()
{
    'use strict';

    B.Tools.GA_Tags = B.Core.Event_Emitter.extend(
    {
        static  : 'ga_tags',
        options :
        {
            send               : true,
            parse              : true,
            true_link_duration : 300,
            classes :
            {
                to_tag : 'tag',
                tagged : 'tagged'
            },
            logs :
            {
                warnings : false,
                send     : false
            }
        },

        /**
         * INIT
         */
        init : function( options )
        {
            this._super(options);

            this.unique_sent = [];

            if( this.options.parse )
                this.parse();
        },

        /**
         * PARSE
         */
        parse : function( target )
        {
            target = target || document;

            var that     = this,
                elements = target.querySelectorAll( '.' + this.options.classes.to_tag + ':not(' + this.options.classes.tagged + ')' );

            function click_handle( e )
            {
                // Set variables
                var element   = this,
                    true_link = element.getAttribute( 'data-tag-true-link' ),
                    datas     = {};

                // True link interpretation
                if( [ '0', 'false', 'nop', 'no' ].indexOf( true_link ) !== -1 )
                    true_link = false;
                else
                    true_link = true;

                // Set options that will be sent
                datas.category = element.getAttribute( 'data-tag-category' );
                datas.action   = element.getAttribute( 'data-tag-action' );
                datas.label    = element.getAttribute( 'data-tag-label' );
                datas.value    = element.getAttribute( 'data-tag-value' );
                datas.unique   = element.getAttribute( 'data-tag-unique' );

                // Send
                that.send( datas );

                // True link that should act as a normal click
                if( true_link )
                {
                    // Set variables
                    var href   = element.getAttribute( 'href' ),
                        target = element.getAttribute( 'target' );

                    // Default target
                    if( !target )
                        target = '_self';

                    // Other than _blank, need to wait
                    if( target !== '_blank' )
                    {
                        // Wait
                        window.setTimeout( function()
                        {
                            window.open( href , target );
                        }, that.options.true_link_duration );

                        // Prevent default
                        e.preventDefault();
                    }
                }
            }

            // Listen
            for( var i = 0, len = elements.length; i < len; i++ )
            {
                var element = elements[ i ];

                // Listen
                element.onclick = click_handle;

                // Set tagged class
                element.classList.add( this.options.classes.tagged );
            }
        },

        /**
         * SEND
         */
        send : function( options )
        {
            var send = [];

            // Error
            if( typeof options !== 'object' )
            {
                // Logs
                if( this.options.logs.warnings )
                    console.warn( 'tag wrong options' );

                return false;
            }

            // Unique
            if( options.unique && this.unique_sent.indexOf( options.unique ) !== -1 )
            {
                // Logs
                if( this.options.logs.warnings )
                    console.warn( 'tag prevent : ' + options.unique );

                return false;
            }

            // Send
            if( this.options.send )
            {
                var sent = false;

                // Category
                if( typeof options.category !== 'undefined' )
                {
                    send.push( options.category );

                    // Action
                    if( typeof options.action !== 'undefined' )
                    {
                        send.push( options.action );

                        // Label
                        if( typeof options.label !== 'undefined' )
                        {
                            send.push( options.label );

                            // Value
                            if( typeof options.value !== 'undefined' )
                            {
                                send.push( options.value );
                            }
                        }

                        // Send only if category and action set
                        // _gaq
                        if( typeof _gaq !== 'undefined' )
                        {
                            _gaq.push( [ '_trackEvent' ].concat( send ) );

                            sent = true;
                        }

                        // ga
                        else if( typeof ga !== 'undefined' )
                        {
                            ga.apply( ga, [ 'send', 'event' ].concat( send ) );

                            sent = true;
                        }

                        else
                        {
                            // Logs
                            if( this.options.logs.warnings )
                                console.warn( 'tag _gaq not defined' );
                        }

                        // Logs
                        if( this.options.logs.send )
                            console.log( 'tag', send );
                    }
                    else
                    {
                        // Logs
                        if( this.options.logs.warnings )
                            console.warn( 'tag missing action' );
                    }
                }
                else
                {
                    // Logs
                    if( this.options.logs.warnings )
                        console.warn( 'tag missing category' );
                }
            }

            // Well sent
            if( sent )
            {
                // Save in unique_sent array
                if( options.unique )
                    this.unique_sent.push( options.unique );

                this.trigger( 'send', [ send ] );
            }
        }
    } );
} )();
