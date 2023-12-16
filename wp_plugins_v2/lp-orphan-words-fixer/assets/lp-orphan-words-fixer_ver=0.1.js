// WeakMap polyfill starts here

/*
 * Copyright 2012 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

if (typeof WeakMap === 'undefined') {
    (function () {
        var defineProperty = Object.defineProperty;
        var counter = Date.now() % 1e9;

        var WeakMap = function () {
            this.name = '__st' + (Math.random() * 1e9 >>> 0) + (counter++ + '__');
        };

        WeakMap.prototype = {
            set: function (key, value) {
                var entry = key[this.name];
                if (entry && entry[0] === key)
                    entry[1] = value;
                else
                    defineProperty(key, this.name, {
                        value: [key, value],
                        writable: true
                    });
                return this;
            },
            get: function (key) {
                var entry;
                return (entry = key[this.name]) && entry[0] === key ?
                    entry[1] : undefined;
            },
            delete: function (key) {
                var entry = key[this.name];
                if (!entry) return false;
                var hasValue = entry[0] === key;
                entry[0] = entry[1] = undefined;
                return hasValue;
            },
            has: function (key) {
                var entry = key[this.name];
                if (!entry) return false;
                return entry[0] === key;
            }
        };

        window.WeakMap = WeakMap;
    })();
}

// WeakMap polyfill ends here
;
(function ($) {

    var proto = {
        version: 1,
        defaults: {
            selector: 'body',
            exclude: '',
            treatBrAsBlock: true
        },
        consts: {
            nonBrackingSpace: '\xa0',
        },
        regex: {
            ignoredTags: /script|style|noscript/i,
            word: /([\s\S]*[^\n\s\xa0]+)([\n\s\xa0]+)([^\n\s\xa0]+[\n\s\xa0]*)$/,
            unDoneTags: /br/i,

        },
        refresh: function (){
            this._refresh(false);
        },
        _init: function (config){
            this.map = new WeakMap();
            this._initConfig(config);
            this._refresh(true);
        },
        _initConfig: function (config) {
            this.config = $.extend({}, this.defaults, config);

            if ($.isArray(this.config.selector)) {
                this.config.selector = this.config.selector.join(',');
            } else if(this.config.selector == ''){
                this.config.selector = this.defaults.selector;
            }

            if ($.isArray(this.config.exclude)) {
                this.config.exclude = this.config.exclude.join(',');
            }
        },
        _refresh: function(initialRefresh){
            var self = this;
            var $selected = $(this.config.selector);

            var selected = $selected.toArray();

            var $excluded = $(this.config.exclude);

            var excluded = $excluded.toArray();
            excluded = excluded.concat($excluded.find('*').toArray());

            this.excludedMap = new WeakMap();

            excluded.forEach(function(element){
                self.excludedMap.set(element, true);
            });

            var elements = selected.filter(function (element) {
                return !self.excludedMap.get(element);
            });

            elements.forEach(function (element) {
                self._traverse(element, null, initialRefresh);
            });
        },
        _traverse: function (element, textParent, initialRefresh) {

            if (this.regex.ignoredTags.test(element.nodeName) || this.excludedMap.get(element))
                return;

            textParent = textParent || element;

            if (!initialRefresh) {
                this._revertSpacing(textParent);
            }

            var childNodes = element.childNodes;
            var i, len = childNodes.length;

            for (i = len - 1; i >= 0; i--) {
                var node = childNodes[i];
                var textParentStat = this.map.get(textParent);
                var isNodeDone = textParentStat && textParentStat.done;

                if (node.nodeType === 1 || node.nodeType === 9) {

                    if (this.config.treatBrAsBlock && textParentStat && node.nodeName.match(this.regex.unDoneTags)) {
                        textParentStat.done = false;
                    }

                    var isInline = $(node).css('display') === 'inline';

                    if (!isInline) {
                        this._traverse(node, null, false);
                    } else if (!isNodeDone) {
                        this._traverse(node, textParent, false);
                    }

                } else if (node.nodeType === 3 && !isNodeDone) {

                    var match = node.nodeValue.match(this.regex.word);
                    if (match) {
                        this._insertNonBreakingSpace(textParent, node, match);                        
                    }
                }
            }
        },
        _revertSpacing: function (textParent) {
            var textParentStat = this.map.get(textParent);
            if (textParentStat) {
                var self = this;
                textParentStat.textNodes.forEach(function (stat) {
                    var pos = stat.spacePosition;
                    var node = stat.node;
                    var str = node.nodeValue;
                    if (node && node.nodeValue[pos] === self.consts.nonBrackingSpace) {
                        node.nodeValue = str.substring(0, pos) + stat.oldSpace + str.substring(pos + 1);
                    }
                });
                this.map.delete(textParent);
            }
        },
        _insertNonBreakingSpace: function(textParent, textNode, regexMatches){
            var preStr = regexMatches[1];
            var innerSpace = regexMatches[2];
            var postStr = regexMatches[3];

            var textNodesObj = this.map.get(textParent) || {
                textNodes: []
            };
            textNodesObj.textNodes.push({
                node: textNode,
                spacePosition: preStr.length,
                oldSpace: innerSpace
            });
            textNodesObj.done = true;
            this.map.set(textParent, textNodesObj);

            textNode.nodeValue = preStr + this.consts.nonBrackingSpace + postStr;
        }
    }

    window.Lp = window.Lp || {};

    if(Lp.orphanFixer && Lp.orphanFixer.version > proto.version) return;

    function OrphanFixer(config){
        this._init(config);
    }

    OrphanFixer.prototype = proto;

    Lp.orphanFixer = function (config){
        return new OrphanFixer(config);
    }

    Lp.orphanFixer.version = proto.version;

})(jQuery);