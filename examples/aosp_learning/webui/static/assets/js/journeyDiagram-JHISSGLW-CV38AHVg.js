import{xa as Rt}from"./index-xVMbBAS-.js";import{Bt as r,H as ht,Vt,jt as Z,t as Bt}from"./src-CqRKEjKz.js";import{U as Lt,W as jt,a as Nt,c as zt,j as Wt,q as Ot,v as Yt,w as Gt,x as L,y as Ht}from"./chunk-CSCIHK7Q-0dH-kyjP.js";import{n as Ut,t as qt}from"./chunk-FMBD7UC4-BPQCqd9e.js";import{a as Xt,l as Jt,n as Kt,o as Qt,s as ut}from"./chunk-ND2GUHAM-Ca1S521X.js";function yt(e){const t=L().journey,l=t.maxLabelWidth;N=0;let d=60;Object.keys(M).forEach(n=>{const c=M[n].color,h={cx:20,cy:d,r:7,fill:c,stroke:"#000",pos:M[n].position};j.drawCircle(e,h);let y=e.append("text").attr("visibility","hidden").text(n);const g=y.node().getBoundingClientRect().width;y.remove();let m=[];if(g<=l)m=[n];else{const s=n.split(" ");let i="";y=e.append("text").attr("visibility","hidden"),s.forEach(a=>{const o=i?`${i} ${a}`:a;if(y.text(o),y.node().getBoundingClientRect().width>l){if(i&&m.push(i),i=a,y.text(a),y.node().getBoundingClientRect().width>l){let f="";for(const p of a)f+=p,y.text(f+"-"),y.node().getBoundingClientRect().width>l&&(m.push(f.slice(0,-1)+"-"),f=p);i=f}}else i=o}),i&&m.push(i),y.remove()}m.forEach((s,i)=>{const a={x:40,y:d+7+i*20,fill:"#666",text:s,textMargin:t.boxTextMargin??5},o=j.drawText(e,a).node().getBoundingClientRect().width;o>N&&o>t.leftMargin-o&&(N=o)}),d+=Math.max(20,m.length*20)})}var O,dt,A,Y,V,B,ft,pt,gt,mt,xt,kt,_t,D,tt,bt,G,wt,et,it,vt,Tt,H,St,Mt,nt,j,$t,M,N,S,C,Ct,w,U,st,Et,rt,Zt,Dt=Rt((()=>{Ut(),Jt(),Wt(),Vt(),Bt(),O=(function(){var e=r(function(s,i,a,o){for(a=a||{},o=s.length;o--;a[s[o]]=i);return a},"o"),t=[6,8,10,11,12,14,16,17,18],l=[1,9],d=[1,10],n=[1,11],c=[1,12],h=[1,13],y=[1,14],g={trace:r(function(){},"trace"),yy:{},symbols_:{error:2,start:3,journey:4,document:5,EOF:6,line:7,SPACE:8,statement:9,NEWLINE:10,title:11,acc_title:12,acc_title_value:13,acc_descr:14,acc_descr_value:15,acc_descr_multiline_value:16,section:17,taskName:18,taskData:19,$accept:0,$end:1},terminals_:{2:"error",4:"journey",6:"EOF",8:"SPACE",10:"NEWLINE",11:"title",12:"acc_title",13:"acc_title_value",14:"acc_descr",15:"acc_descr_value",16:"acc_descr_multiline_value",17:"section",18:"taskName",19:"taskData"},productions_:[0,[3,3],[5,0],[5,2],[7,2],[7,1],[7,1],[7,1],[9,1],[9,2],[9,2],[9,1],[9,1],[9,2]],performAction:r(function(i,a,o,f,p,u,_){var x=u.length-1;switch(p){case 1:return u[x-1];case 2:this.$=[];break;case 3:u[x-1].push(u[x]),this.$=u[x-1];break;case 4:case 5:this.$=u[x];break;case 6:case 7:this.$=[];break;case 8:f.setDiagramTitle(u[x].substr(6)),this.$=u[x].substr(6);break;case 9:this.$=u[x].trim(),f.setAccTitle(this.$);break;case 10:case 11:this.$=u[x].trim(),f.setAccDescription(this.$);break;case 12:f.addSection(u[x].substr(8)),this.$=u[x].substr(8);break;case 13:f.addTask(u[x-1],u[x]),this.$="task";break}},"anonymous"),table:[{3:1,4:[1,2]},{1:[3]},e(t,[2,2],{5:3}),{6:[1,4],7:5,8:[1,6],9:7,10:[1,8],11:l,12:d,14:n,16:c,17:h,18:y},e(t,[2,7],{1:[2,1]}),e(t,[2,3]),{9:15,11:l,12:d,14:n,16:c,17:h,18:y},e(t,[2,5]),e(t,[2,6]),e(t,[2,8]),{13:[1,16]},{15:[1,17]},e(t,[2,11]),e(t,[2,12]),{19:[1,18]},e(t,[2,4]),e(t,[2,9]),e(t,[2,10]),e(t,[2,13])],defaultActions:{},parseError:r(function(i,a){if(a.recoverable)this.trace(i);else{var o=new Error(i);throw o.hash=a,o}},"parseError"),parse:r(function(i){var a=this,o=[0],f=[],p=[null],u=[],_=this.table,x="",E=0,F=0,at=0,Pt=2,lt=1,It=u.slice.call(arguments,1),k=Object.create(this.lexer),P={yy:{}};for(var q in this.yy)Object.prototype.hasOwnProperty.call(this.yy,q)&&(P.yy[q]=this.yy[q]);k.setInput(i,P.yy),P.yy.lexer=k,P.yy.parser=this,typeof k.yylloc>"u"&&(k.yylloc={});var X=k.yylloc;u.push(X);var At=k.options&&k.options.ranges;typeof P.yy.parseError=="function"?this.parseError=P.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;function Ft(T){o.length=o.length-2*T,p.length=p.length-T,u.length=u.length-T}r(Ft,"popStack");function ot(){var T=f.pop()||k.lex()||lt;return typeof T!="number"&&(T instanceof Array&&(f=T,T=f.pop()),T=a.symbols_[T]||T),T}r(ot,"lex");for(var b,J,I,v,K,R={},z,$,ct,W;;){if(I=o[o.length-1],this.defaultActions[I]?v=this.defaultActions[I]:((b===null||typeof b>"u")&&(b=ot()),v=_[I]&&_[I][b]),typeof v>"u"||!v.length||!v[0]){var Q="";W=[];for(z in _[I])this.terminals_[z]&&z>Pt&&W.push("'"+this.terminals_[z]+"'");k.showPosition?Q="Parse error on line "+(E+1)+`:
`+k.showPosition()+`
Expecting `+W.join(", ")+", got '"+(this.terminals_[b]||b)+"'":Q="Parse error on line "+(E+1)+": Unexpected "+(b==lt?"end of input":"'"+(this.terminals_[b]||b)+"'"),this.parseError(Q,{text:k.match,token:this.terminals_[b]||b,line:k.yylineno,loc:X,expected:W})}if(v[0]instanceof Array&&v.length>1)throw new Error("Parse Error: multiple actions possible at state: "+I+", token: "+b);switch(v[0]){case 1:o.push(b),p.push(k.yytext),u.push(k.yylloc),o.push(v[1]),b=null,J?(b=J,J=null):(F=k.yyleng,x=k.yytext,E=k.yylineno,X=k.yylloc,at>0&&at--);break;case 2:if($=this.productions_[v[1]][1],R.$=p[p.length-$],R._$={first_line:u[u.length-($||1)].first_line,last_line:u[u.length-1].last_line,first_column:u[u.length-($||1)].first_column,last_column:u[u.length-1].last_column},At&&(R._$.range=[u[u.length-($||1)].range[0],u[u.length-1].range[1]]),K=this.performAction.apply(R,[x,F,E,P.yy,v[1],p,u].concat(It)),typeof K<"u")return K;$&&(o=o.slice(0,-1*$*2),p=p.slice(0,-1*$),u=u.slice(0,-1*$)),o.push(this.productions_[v[1]][0]),p.push(R.$),u.push(R._$),ct=_[o[o.length-2]][o[o.length-1]],o.push(ct);break;case 3:return!0}}return!0},"parse")};g.lexer=(function(){return{EOF:1,parseError:r(function(i,a){if(this.yy.parser)this.yy.parser.parseError(i,a);else throw new Error(i)},"parseError"),setInput:r(function(s,i){return this.yy=i||this.yy||{},this._input=s,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},"setInput"),input:r(function(){var s=this._input[0];return this.yytext+=s,this.yyleng++,this.offset++,this.match+=s,this.matched+=s,s.match(/(?:\r\n?|\n).*/g)?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),s},"input"),unput:r(function(s){var i=s.length,a=s.split(/(?:\r\n?|\n)/g);this._input=s+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-i),this.offset-=i;var o=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),a.length-1&&(this.yylineno-=a.length-1);var f=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:a?(a.length===o.length?this.yylloc.first_column:0)+o[o.length-a.length].length-a[0].length:this.yylloc.first_column-i},this.options.ranges&&(this.yylloc.range=[f[0],f[0]+this.yyleng-i]),this.yyleng=this.yytext.length,this},"unput"),more:r(function(){return this._more=!0,this},"more"),reject:r(function(){if(this.options.backtrack_lexer)this._backtrack=!0;else return this.parseError("Lexical error on line "+(this.yylineno+1)+`. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).
`+this.showPosition(),{text:"",token:null,line:this.yylineno});return this},"reject"),less:r(function(s){this.unput(this.match.slice(s))},"less"),pastInput:r(function(){var s=this.matched.substr(0,this.matched.length-this.match.length);return(s.length>20?"...":"")+s.substr(-20).replace(/\n/g,"")},"pastInput"),upcomingInput:r(function(){var s=this.match;return s.length<20&&(s+=this._input.substr(0,20-s.length)),(s.substr(0,20)+(s.length>20?"...":"")).replace(/\n/g,"")},"upcomingInput"),showPosition:r(function(){var s=this.pastInput(),i=new Array(s.length+1).join("-");return s+this.upcomingInput()+`
`+i+"^"},"showPosition"),test_match:r(function(s,i){var a,o,f;if(this.options.backtrack_lexer&&(f={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(f.yylloc.range=this.yylloc.range.slice(0))),o=s[0].match(/(?:\r\n?|\n).*/g),o&&(this.yylineno+=o.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:o?o[o.length-1].length-o[o.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+s[0].length},this.yytext+=s[0],this.match+=s[0],this.matches=s,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(s[0].length),this.matched+=s[0],a=this.performAction.call(this,this.yy,this,i,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),a)return a;if(this._backtrack){for(var p in f)this[p]=f[p];return!1}return!1},"test_match"),next:r(function(){if(this.done)return this.EOF;this._input||(this.done=!0);var s,i,a,o;this._more||(this.yytext="",this.match="");for(var f=this._currentRules(),p=0;p<f.length;p++)if(a=this._input.match(this.rules[f[p]]),a&&(!i||a[0].length>i[0].length)){if(i=a,o=p,this.options.backtrack_lexer){if(s=this.test_match(a,f[p]),s!==!1)return s;if(this._backtrack){i=!1;continue}else return!1}else if(!this.options.flex)break}return i?(s=this.test_match(i,f[o]),s!==!1?s:!1):this._input===""?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+`. Unrecognized text.
`+this.showPosition(),{text:"",token:null,line:this.yylineno})},"next"),lex:r(function(){var i=this.next();return i||this.lex()},"lex"),begin:r(function(i){this.conditionStack.push(i)},"begin"),popState:r(function(){return this.conditionStack.length-1>0?this.conditionStack.pop():this.conditionStack[0]},"popState"),_currentRules:r(function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},"_currentRules"),topState:r(function(i){return i=this.conditionStack.length-1-Math.abs(i||0),i>=0?this.conditionStack[i]:"INITIAL"},"topState"),pushState:r(function(i){this.begin(i)},"pushState"),stateStackSize:r(function(){return this.conditionStack.length},"stateStackSize"),options:{"case-insensitive":!0},performAction:r(function(i,a,o,f){switch(o){case 0:break;case 1:break;case 2:return 10;case 3:break;case 4:break;case 5:return 4;case 6:return 11;case 7:return this.begin("acc_title"),12;case 8:return this.popState(),"acc_title_value";case 9:return this.begin("acc_descr"),14;case 10:return this.popState(),"acc_descr_value";case 11:this.begin("acc_descr_multiline");break;case 12:this.popState();break;case 13:return"acc_descr_multiline_value";case 14:return 17;case 15:return 18;case 16:return 19;case 17:return":";case 18:return 6;case 19:return"INVALID"}},"anonymous"),rules:[/^(?:%(?!\{)[^\n]*)/i,/^(?:[^\}]%%[^\n]*)/i,/^(?:[\n]+)/i,/^(?:\s+)/i,/^(?:#[^\n]*)/i,/^(?:journey\b)/i,/^(?:title\s[^#\n;]+)/i,/^(?:accTitle\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*\{\s*)/i,/^(?:[\}])/i,/^(?:[^\}]*)/i,/^(?:section\s[^#:\n;]+)/i,/^(?:[^#:\n;]+)/i,/^(?::[^#\n;]+)/i,/^(?::)/i,/^(?:$)/i,/^(?:.)/i],conditions:{acc_descr_multiline:{rules:[12,13],inclusive:!1},acc_descr:{rules:[10],inclusive:!1},acc_title:{rules:[8],inclusive:!1},INITIAL:{rules:[0,1,2,3,4,5,6,7,9,11,14,15,16,17,18,19],inclusive:!0}}}})();function m(){this.yy={}}return r(m,"Parser"),m.prototype=g,g.Parser=m,new m})(),O.parser=O,dt=O,A="",Y=[],V=[],B=[],ft=r(function(){Y.length=0,V.length=0,A="",B.length=0,Nt()},"clear"),pt=r(function(e){A=e,Y.push(e)},"addSection"),gt=r(function(){return Y},"getSections"),mt=r(function(){let e=D();const t=100;let l=0;for(;!e&&l<t;)e=D(),l++;return V.push(...B),V},"getTasks"),xt=r(function(){const e=[];return V.forEach(t=>{t.people&&e.push(...t.people)}),[...new Set(e)].sort()},"updateActors"),kt=r(function(e,t){const l=t.substr(1).split(":");let d=0,n=[];l.length===1?(d=Number(l[0]),n=[]):(d=Number(l[0]),n=l[1].split(","));const c=n.map(y=>y.trim()),h={section:A,type:A,people:c,task:e,score:d};B.push(h)},"addTask"),_t=r(function(e){const t={section:A,type:A,description:e,task:e,classes:[]};V.push(t)},"addTaskOrg"),D=r(function(){const e=r(function(l){return B[l].processed},"compileTask");let t=!0;for(const[l,d]of B.entries())e(l),t=t&&d.processed;return t},"compileTasks"),tt={getConfig:r(()=>L().journey,"getConfig"),clear:ft,setDiagramTitle:Ot,getDiagramTitle:Gt,setAccTitle:jt,getAccTitle:Ht,setAccDescription:Lt,getAccDescription:Yt,addSection:pt,getSections:gt,getTasks:mt,addTask:kt,addTaskOrg:_t,getActors:r(function(){return xt()},"getActors")},bt=r(e=>`.label {
    font-family: ${e.fontFamily};
    color: ${e.textColor};
  }
  .mouth {
    stroke: #666;
  }

  line {
    stroke: ${e.textColor}
  }

  .legend {
    fill: ${e.textColor};
    font-family: ${e.fontFamily};
  }

  .label text {
    fill: #333;
  }
  .label {
    color: ${e.textColor}
  }

  .face {
    ${e.faceColor?`fill: ${e.faceColor}`:"fill: #FFF8DC"};
    stroke: #999;
  }

  .node rect,
  .node circle,
  .node ellipse,
  .node polygon,
  .node path {
    fill: ${e.mainBkg};
    stroke: ${e.nodeBorder};
    stroke-width: 1px;
  }

  .node .label {
    text-align: center;
  }
  .node.clickable {
    cursor: pointer;
  }

  .arrowheadPath {
    fill: ${e.arrowheadColor};
  }

  .edgePath .path {
    stroke: ${e.lineColor};
    stroke-width: 1.5px;
  }

  .flowchart-link {
    stroke: ${e.lineColor};
    fill: none;
  }

  .edgeLabel {
    background-color: ${e.edgeLabelBackground};
    rect {
      opacity: 0.5;
    }
    text-align: center;
  }

  .cluster rect {
  }

  .cluster text {
    fill: ${e.titleColor};
  }

  div.mermaidTooltip {
    position: absolute;
    text-align: center;
    max-width: 200px;
    padding: 2px;
    font-family: ${e.fontFamily};
    font-size: 12px;
    background: ${e.tertiaryColor};
    border: 1px solid ${e.border2};
    border-radius: 2px;
    pointer-events: none;
    z-index: 100;
  }

  .task-type-0, .section-type-0  {
    ${e.fillType0?`fill: ${e.fillType0}`:""};
  }
  .task-type-1, .section-type-1  {
    ${e.fillType0?`fill: ${e.fillType1}`:""};
  }
  .task-type-2, .section-type-2  {
    ${e.fillType0?`fill: ${e.fillType2}`:""};
  }
  .task-type-3, .section-type-3  {
    ${e.fillType0?`fill: ${e.fillType3}`:""};
  }
  .task-type-4, .section-type-4  {
    ${e.fillType0?`fill: ${e.fillType4}`:""};
  }
  .task-type-5, .section-type-5  {
    ${e.fillType0?`fill: ${e.fillType5}`:""};
  }
  .task-type-6, .section-type-6  {
    ${e.fillType0?`fill: ${e.fillType6}`:""};
  }
  .task-type-7, .section-type-7  {
    ${e.fillType0?`fill: ${e.fillType7}`:""};
  }

  .actor-0 {
    ${e.actor0?`fill: ${e.actor0}`:""};
  }
  .actor-1 {
    ${e.actor1?`fill: ${e.actor1}`:""};
  }
  .actor-2 {
    ${e.actor2?`fill: ${e.actor2}`:""};
  }
  .actor-3 {
    ${e.actor3?`fill: ${e.actor3}`:""};
  }
  .actor-4 {
    ${e.actor4?`fill: ${e.actor4}`:""};
  }
  .actor-5 {
    ${e.actor5?`fill: ${e.actor5}`:""};
  }
  ${qt()}
`,"getStyles"),G=r(function(e,t){return Xt(e,t)},"drawRect"),wt=r(function(e,t){const d=e.append("circle").attr("cx",t.cx).attr("cy",t.cy).attr("class","face").attr("r",15).attr("stroke-width",2).attr("overflow","visible"),n=e.append("g");n.append("circle").attr("cx",t.cx-15/3).attr("cy",t.cy-15/3).attr("r",1.5).attr("stroke-width",2).attr("fill","#666").attr("stroke","#666"),n.append("circle").attr("cx",t.cx+15/3).attr("cy",t.cy-15/3).attr("r",1.5).attr("stroke-width",2).attr("fill","#666").attr("stroke","#666");function c(g){const m=ht().startAngle(Math.PI/2).endAngle(3*(Math.PI/2)).innerRadius(7.5).outerRadius(6.8181818181818175);g.append("path").attr("class","mouth").attr("d",m).attr("transform","translate("+t.cx+","+(t.cy+2)+")")}r(c,"smile");function h(g){const m=ht().startAngle(3*Math.PI/2).endAngle(5*(Math.PI/2)).innerRadius(7.5).outerRadius(6.8181818181818175);g.append("path").attr("class","mouth").attr("d",m).attr("transform","translate("+t.cx+","+(t.cy+7)+")")}r(h,"sad");function y(g){g.append("line").attr("class","mouth").attr("stroke",2).attr("x1",t.cx-5).attr("y1",t.cy+7).attr("x2",t.cx+5).attr("y2",t.cy+7).attr("class","mouth").attr("stroke-width","1px").attr("stroke","#666")}return r(y,"ambivalent"),t.score>3?c(n):t.score<3?h(n):y(n),d},"drawFace"),et=r(function(e,t){const l=e.append("circle");return l.attr("cx",t.cx),l.attr("cy",t.cy),l.attr("class","actor-"+t.pos),l.attr("fill",t.fill),l.attr("stroke",t.stroke),l.attr("r",t.r),l.class!==void 0&&l.attr("class",l.class),t.title!==void 0&&l.append("title").text(t.title),l},"drawCircle"),it=r(function(e,t){return Qt(e,t)},"drawText"),vt=r(function(e,t){function l(n,c,h,y,g){return n+","+c+" "+(n+h)+","+c+" "+(n+h)+","+(c+y-g)+" "+(n+h-g*1.2)+","+(c+y)+" "+n+","+(c+y)}r(l,"genPoints");const d=e.append("polygon");d.attr("points",l(t.x,t.y,50,20,7)),d.attr("class","labelBox"),t.y=t.y+t.labelMargin,t.x=t.x+.5*t.labelMargin,it(e,t)},"drawLabel"),Tt=r(function(e,t,l){const d=e.append("g"),n=ut();n.x=t.x,n.y=t.y,n.fill=t.fill,n.width=l.width*t.taskCount+l.diagramMarginX*(t.taskCount-1),n.height=l.height,n.class="journey-section section-type-"+t.num,n.rx=3,n.ry=3,G(d,n),nt(l)(t.text,d,n.x,n.y,n.width,n.height,{class:"journey-section section-type-"+t.num},l,t.colour)},"drawSection"),H=-1,St=r(function(e,t,l,d){const n=t.x+l.width/2,c=e.append("g");H++,c.append("line").attr("id",d+"-task"+H).attr("x1",n).attr("y1",t.y).attr("x2",n).attr("y2",450).attr("class","task-line").attr("stroke-width","1px").attr("stroke-dasharray","4 2").attr("stroke","#666"),wt(c,{cx:n,cy:300+(5-t.score)*30,score:t.score});const h=ut();h.x=t.x,h.y=t.y,h.fill=t.fill,h.width=l.width,h.height=l.height,h.class="task task-type-"+t.num,h.rx=3,h.ry=3,G(c,h);let y=t.x+14;t.people.forEach(g=>{const m=t.actors[g].color;et(c,{cx:y,cy:t.y,r:7,fill:m,stroke:"#000",title:g,pos:t.actors[g].position}),y+=10}),nt(l)(t.task,c,h.x,h.y,h.width,h.height,{class:"task"},l,t.colour)},"drawTask"),Mt=r(function(e,t){Kt(e,t)},"drawBackgroundRect"),nt=(function(){function e(n,c,h,y,g,m,s,i){d(c.append("text").attr("x",h+g/2).attr("y",y+m/2+5).style("font-color",i).style("text-anchor","middle").text(n),s)}r(e,"byText");function t(n,c,h,y,g,m,s,i,a){const{taskFontSize:o,taskFontFamily:f}=i,p=n.split(/<br\s*\/?>/gi);for(let u=0;u<p.length;u++){const _=u*o-o*(p.length-1)/2,x=c.append("text").attr("x",h+g/2).attr("y",y).attr("fill",a).style("text-anchor","middle").style("font-size",o).style("font-family",f);x.append("tspan").attr("x",h+g/2).attr("dy",_).text(p[u]),x.attr("y",y+m/2).attr("dominant-baseline","central").attr("alignment-baseline","central"),d(x,s)}}r(t,"byTspan");function l(n,c,h,y,g,m,s,i){const a=c.append("switch"),o=a.append("foreignObject").attr("x",h).attr("y",y).attr("width",g).attr("height",m).attr("position","fixed").append("xhtml:div").style("display","table").style("height","100%").style("width","100%");o.append("div").attr("class","label").style("display","table-cell").style("text-align","center").style("vertical-align","middle").text(n),t(n,a,h,y,g,m,s,i),d(o,s)}r(l,"byFo");function d(n,c){for(const h in c)h in c&&n.attr(h,c[h])}return r(d,"_setTextAttrs"),function(n){return n.textPlacement==="fo"?l:n.textPlacement==="old"?e:t}})(),j={drawRect:G,drawCircle:et,drawSection:Tt,drawText:it,drawLabel:vt,drawTask:St,drawBackgroundRect:Mt,initGraphics:r(function(e,t){H=-1,e.append("defs").append("marker").attr("id",t+"-arrowhead").attr("refX",5).attr("refY",2).attr("markerWidth",6).attr("markerHeight",4).attr("orient","auto").append("path").attr("d","M 0,0 V 4 L6,2 Z")},"initGraphics")},$t=r(function(e){Object.keys(e).forEach(function(t){S[t]=e[t]})},"setConf"),M={},N=0,r(yt,"drawActorLegend"),S=L().journey,C=0,Ct=r(function(e,t,l,d){const n=L(),c=n.journey.titleColor,h=n.journey.titleFontSize,y=n.journey.titleFontFamily,g=n.securityLevel;let m;g==="sandbox"&&(m=Z("#i"+t));const s=g==="sandbox"?Z(m.nodes()[0].contentDocument.body):Z("body");w.init();const i=s.select("#"+t);j.initGraphics(i,t);const a=d.db.getTasks(),o=d.db.getDiagramTitle(),f=d.db.getActors();for(const F in M)delete M[F];let p=0;f.forEach(F=>{M[F]={color:S.actorColours[p%S.actorColours.length],position:p},p++}),yt(i),C=S.leftMargin+N,w.insert(0,0,C,Object.keys(M).length*50),Et(i,a,0,t);const u=w.getBounds();o&&i.append("text").text(o).attr("x",C).attr("font-size",h).attr("font-weight","bold").attr("y",25).attr("fill",c).attr("font-family",y);const _=u.stopy-u.starty+2*S.diagramMarginY,x=C+u.stopx+2*S.diagramMarginX;zt(i,_,x,S.useMaxWidth),i.append("line").attr("x1",C).attr("y1",S.height*4).attr("x2",x-C-4).attr("y2",S.height*4).attr("stroke-width",4).attr("stroke","black").attr("marker-end","url(#"+t+"-arrowhead)");const E=o?70:0;i.attr("viewBox",`${u.startx} -25 ${x} ${_+E}`),i.attr("preserveAspectRatio","xMinYMin meet"),i.attr("height",_+E+25)},"draw"),w={data:{startx:void 0,stopx:void 0,starty:void 0,stopy:void 0},verticalPos:0,sequenceItems:[],init:r(function(){this.sequenceItems=[],this.data={startx:void 0,stopx:void 0,starty:void 0,stopy:void 0},this.verticalPos=0},"init"),updateVal:r(function(e,t,l,d){e[t]===void 0?e[t]=l:e[t]=d(l,e[t])},"updateVal"),updateBounds:r(function(e,t,l,d){const n=L().journey,c=this;let h=0;function y(g){return r(function(s){h++;const i=c.sequenceItems.length-h+1;c.updateVal(s,"starty",t-i*n.boxMargin,Math.min),c.updateVal(s,"stopy",d+i*n.boxMargin,Math.max),c.updateVal(w.data,"startx",e-i*n.boxMargin,Math.min),c.updateVal(w.data,"stopx",l+i*n.boxMargin,Math.max),g!=="activation"&&(c.updateVal(s,"startx",e-i*n.boxMargin,Math.min),c.updateVal(s,"stopx",l+i*n.boxMargin,Math.max),c.updateVal(w.data,"starty",t-i*n.boxMargin,Math.min),c.updateVal(w.data,"stopy",d+i*n.boxMargin,Math.max))},"updateItemBounds")}r(y,"updateFn"),this.sequenceItems.forEach(y())},"updateBounds"),insert:r(function(e,t,l,d){const n=Math.min(e,l),c=Math.max(e,l),h=Math.min(t,d),y=Math.max(t,d);this.updateVal(w.data,"startx",n,Math.min),this.updateVal(w.data,"starty",h,Math.min),this.updateVal(w.data,"stopx",c,Math.max),this.updateVal(w.data,"stopy",y,Math.max),this.updateBounds(n,h,c,y)},"insert"),bumpVerticalPos:r(function(e){this.verticalPos=this.verticalPos+e,this.data.stopy=this.verticalPos},"bumpVerticalPos"),getVerticalPos:r(function(){return this.verticalPos},"getVerticalPos"),getBounds:r(function(){return this.data},"getBounds")},U=S.sectionFills,st=S.sectionColours,Et=r(function(e,t,l,d){const n=L().journey;let c="";const h=l+(n.height*2+n.diagramMarginY);let y=0,g="#CCC",m="black",s=0;for(const[i,a]of t.entries()){if(c!==a.section){g=U[y%U.length],s=y%U.length,m=st[y%st.length];let f=0;const p=a.section;for(let _=i;_<t.length&&t[_].section==p;_++)f=f+1;const u={x:i*n.taskMargin+i*n.width+C,y:50,text:a.section,fill:g,num:s,colour:m,taskCount:f};j.drawSection(e,u,n),c=a.section,y++}const o=a.people.reduce((f,p)=>(M[p]&&(f[p]=M[p]),f),{});a.x=i*n.taskMargin+i*n.width+C,a.y=h,a.width=n.diagramMarginX,a.height=n.diagramMarginY,a.colour=m,a.fill=g,a.num=s,a.actors=o,j.drawTask(e,a,n,d),w.insert(a.x,a.y,a.x+a.width+n.taskMargin,450)}},"drawTasks"),rt={setConf:$t,draw:Ct},Zt={parser:dt,db:tt,renderer:rt,styles:bt,init:r(e=>{rt.setConf(e.journey),tt.clear()},"init")}}));Dt();export{Zt as diagram};
