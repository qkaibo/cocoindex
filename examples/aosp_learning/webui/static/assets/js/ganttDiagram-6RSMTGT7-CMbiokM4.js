import{Ta as dt,ba as Nt,xa as Je}from"./index-xVMbBAS-.js";import{$ as ti,Bt as u,Ht as nt,It as ei,Mt as ii,Nt as si,Ot as ni,Rt as ri,Vt as ai,Wt as ie,Y as se,Z as ne,_t as oi,at as ci,dt as re,et as li,ht as ae,it as ui,jt as Dt,lt as oe,nt as di,pt as ce,q as fi,rt as hi,st as le,t as mi,tt as ki}from"./src-CqRKEjKz.js";import{U as yi,W as gi,a as pi,c as Ti,j as vi,q as xi,s as bi,v as _i,w as wi,x as ft,y as Di}from"./chunk-CSCIHK7Q-0dH-kyjP.js";import{t as Si}from"./dist-DvGKv9zy.js";import{_ as Ci,d as Mi}from"./chunk-5ZQYHXKU-gDhHgwVs.js";var Ei=Nt(((t,s)=>{(function(n,e){typeof t=="object"&&typeof s<"u"?s.exports=e():typeof define=="function"&&define.amd?define(e):(n=typeof globalThis<"u"?globalThis:n||self).dayjs_plugin_isoWeek=e()})(t,(function(){"use strict";var n="day";return function(e,r,m){var T=function(E){return E.add(4-E.isoWeekday(),n)},S=r.prototype;S.isoWeekYear=function(){return T(this).year()},S.isoWeek=function(E){if(!this.$utils().u(E))return this.add(7*(E-this.isoWeek()),n);var D,L,O,z,P=T(this),C=(D=this.isoWeekYear(),L=this.$u,O=(L?m.utc:m)().year(D).startOf("year"),z=4-O.isoWeekday(),O.isoWeekday()>4&&(z+=7),O.add(z,n));return P.diff(C,"week")+1},S.isoWeekday=function(E){return this.$utils().u(E)?this.day()||7:this.day(this.day()%7?E:E-7)};var A=S.startOf;S.startOf=function(E,D){var L=this.$utils(),O=!!L.u(D)||D;return L.p(E)==="isoweek"?O?this.date(this.date()-(this.isoWeekday()-1)).startOf("day"):this.date(this.date()-1-(this.isoWeekday()-1)+7).endOf("day"):A.bind(this)(E,D)}}}))})),Yi=Nt(((t,s)=>{(function(n,e){typeof t=="object"&&typeof s<"u"?s.exports=e():typeof define=="function"&&define.amd?define(e):(n=typeof globalThis<"u"?globalThis:n||self).dayjs_plugin_customParseFormat=e()})(t,(function(){"use strict";var n={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"},e=/(\[[^[]*\])|([-_:/.,()\s]+)|(A|a|Q|YYYY|YY?|ww?|MM?M?M?|Do|DD?|hh?|HH?|mm?|ss?|S{1,3}|z|ZZ?)/g,r=/\d/,m=/\d\d/,T=/\d\d?/,S=/\d*[^-_:/,()\s\d]+/,A={},E=function(b){return(b=+b)+(b>68?1900:2e3)},D=function(b){return function(M){this[b]=+M}},L=[/[+-]\d\d:?(\d\d)?|Z/,function(b){(this.zone||(this.zone={})).offset=(function(M){if(!M||M==="Z")return 0;var F=M.match(/([+-]|\d\d)/g),I=60*F[1]+(+F[2]||0);return I===0?0:F[0]==="+"?-I:I})(b)}],O=function(b){var M=A[b];return M&&(M.indexOf?M:M.s.concat(M.f))},z=function(b,M){var F,I=A.meridiem;if(I){for(var B=1;B<=24;B+=1)if(b.indexOf(I(B,0,M))>-1){F=B>12;break}}else F=b===(M?"pm":"PM");return F},P={A:[S,function(b){this.afternoon=z(b,!1)}],a:[S,function(b){this.afternoon=z(b,!0)}],Q:[r,function(b){this.month=3*(b-1)+1}],S:[r,function(b){this.milliseconds=100*+b}],SS:[m,function(b){this.milliseconds=10*+b}],SSS:[/\d{3}/,function(b){this.milliseconds=+b}],s:[T,D("seconds")],ss:[T,D("seconds")],m:[T,D("minutes")],mm:[T,D("minutes")],H:[T,D("hours")],h:[T,D("hours")],HH:[T,D("hours")],hh:[T,D("hours")],D:[T,D("day")],DD:[m,D("day")],Do:[S,function(b){var M=A.ordinal,F=b.match(/\d+/);if(this.day=F[0],M)for(var I=1;I<=31;I+=1)M(I).replace(/\[|\]/g,"")===b&&(this.day=I)}],w:[T,D("week")],ww:[m,D("week")],M:[T,D("month")],MM:[m,D("month")],MMM:[S,function(b){var M=O("months"),F=(O("monthsShort")||M.map((function(I){return I.slice(0,3)}))).indexOf(b)+1;if(F<1)throw new Error;this.month=F%12||F}],MMMM:[S,function(b){var M=O("months").indexOf(b)+1;if(M<1)throw new Error;this.month=M%12||M}],Y:[/[+-]?\d+/,D("year")],YY:[m,function(b){this.year=E(b)}],YYYY:[/\d{4}/,D("year")],Z:L,ZZ:L};function C(b){for(var M=b,F=A&&A.formats,I=(b=M.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g,(function(p,g,a){var l=a&&a.toUpperCase();return g||F[a]||n[a]||F[l].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,(function(y,h,d){return h||d.slice(1)}))}))).match(e),B=I.length,j=0;j<B;j+=1){var Y=I[j],v=P[Y],k=v&&v[0],f=v&&v[1];I[j]=f?{regex:k,parser:f}:Y.replace(/^\[|\]$/g,"")}return function(p){for(var g={},a=0,l=0;a<B;a+=1){var y=I[a];if(typeof y=="string")l+=y.length;else{var h=y.regex,d=y.parser,_=p.slice(l),i=h.exec(_)[0];d.call(g,i),p=p.replace(i,"")}}return(function(c){var o=c.afternoon;if(o!==void 0){var x=c.hours;o?x<12&&(c.hours+=12):x===12&&(c.hours=0),delete c.afternoon}})(g),g}}return function(b,M,F){F.p.customParseFormat=!0,b&&b.parseTwoDigitYear&&(E=b.parseTwoDigitYear);var I=M.prototype,B=I.parse;I.parse=function(j){var Y=j.date,v=j.utc,k=j.args;this.$u=v;var f=k[1];if(typeof f=="string"){var p=k[2]===!0,g=k[3]===!0,a=p||g,l=k[2];g&&(l=k[2]),A=this.$locale(),!p&&l&&(A=F.Ls[l]),this.$d=(function(_,i,c,o){try{if(["x","X"].indexOf(i)>-1)return new Date((i==="X"?1e3:1)*_);var x=C(i)(_),$=x.year,w=x.month,W=x.day,V=x.hours,gt=x.minutes,N=x.seconds,K=x.milliseconds,ct=x.zone,lt=x.week,pt=new Date,Tt=W||($||w?1:pt.getDate()),ut=$||pt.getFullYear(),R=0;$&&!w||(R=w>0?w-1:pt.getMonth());var et,U=V||0,G=gt||0,st=N||0,Q=K||0;return ct?new Date(Date.UTC(ut,R,Tt,U,G,st,Q+60*ct.offset*1e3)):c?new Date(Date.UTC(ut,R,Tt,U,G,st,Q)):(et=new Date(ut,R,Tt,U,G,st,Q),lt&&(et=o(et).week(lt).toDate()),et)}catch{return new Date("")}})(Y,f,v,F),this.init(),l&&l!==!0&&(this.$L=this.locale(l).$L),a&&Y!=this.format(f)&&(this.$d=new Date("")),A={}}else if(f instanceof Array)for(var y=f.length,h=1;h<=y;h+=1){k[1]=f[h-1];var d=F.apply(this,k);if(d.isValid()){this.$d=d.$d,this.$L=d.$L,this.init();break}h===y&&(this.$d=new Date(""))}else B.call(this,j)}}}))})),Ii=Nt(((t,s)=>{(function(n,e){typeof t=="object"&&typeof s<"u"?s.exports=e():typeof define=="function"&&define.amd?define(e):(n=typeof globalThis<"u"?globalThis:n||self).dayjs_plugin_advancedFormat=e()})(t,(function(){"use strict";return function(n,e){var r=e.prototype,m=r.format;r.format=function(T){var S=this,A=this.$locale();if(!this.isValid())return m.bind(this)(T);var E=this.$utils(),D=(T||"YYYY-MM-DDTHH:mm:ssZ").replace(/\[([^\]]+)]|Q|wo|ww|w|WW|W|zzz|z|gggg|GGGG|Do|X|x|k{1,2}|S/g,(function(L){switch(L){case"Q":return Math.ceil((S.$M+1)/3);case"Do":return A.ordinal(S.$D);case"gggg":return S.weekYear();case"GGGG":return S.isoWeekYear();case"wo":return A.ordinal(S.week(),"W");case"w":case"ww":return E.s(S.week(),L==="w"?1:2,"0");case"W":case"WW":return E.s(S.isoWeek(),L==="W"?1:2,"0");case"k":case"kk":return E.s(String(S.$H===0?24:S.$H),L==="k"?1:2,"0");case"X":return Math.floor(S.$d.getTime()/1e3);case"x":return S.$d.getTime();case"z":return"["+S.offsetName()+"]";case"zzz":return"["+S.offsetName("long")+"]";default:return L}}));return m.bind(this)(D)}}}))})),$i=Nt(((t,s)=>{(function(n,e){typeof t=="object"&&typeof s<"u"?s.exports=e():typeof define=="function"&&define.amd?define(e):(n=typeof globalThis<"u"?globalThis:n||self).dayjs_plugin_duration=e()})(t,(function(){"use strict";var n,e,r=1e3,m=6e4,T=36e5,S=864e5,A=31536e6,E=2628e6,D=/^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/,L=/\[([^\]]+)]|YYYY|YY|Y|M{1,2}|D{1,2}|H{1,2}|m{1,2}|s{1,2}|SSS/g,O={years:A,months:E,days:S,hours:T,minutes:m,seconds:r,milliseconds:1,weeks:6048e5},z=function(Y){return Y instanceof B},P=function(Y,v,k){return new B(Y,k,v.$l)},C=function(Y){return e.p(Y)+"s"},b=function(Y){return Y<0},M=function(Y){return b(Y)?Math.ceil(Y):Math.floor(Y)},F=function(Y){return Math.abs(Y)},I=function(Y,v){return Y?b(Y)?{negative:!0,format:""+F(Y)+v}:{negative:!1,format:""+Y+v}:{negative:!1,format:""}},B=(function(){function Y(k,f,p){var g=this;if(this.$d={},this.$l=p,k===void 0&&(this.$ms=0,this.parseFromMilliseconds()),f)return P(k*O[C(f)],this);if(typeof k=="number")return this.$ms=k,this.parseFromMilliseconds(),this;if(typeof k=="object")return Object.keys(k).forEach((function(y){g.$d[C(y)]=k[y]})),this.calMilliseconds(),this;if(typeof k=="string"){var a=k.match(D);if(a){var l=a.slice(2).map((function(y){return y!=null?Number(y):0}));return this.$d.years=l[0],this.$d.months=l[1],this.$d.weeks=l[2],this.$d.days=l[3],this.$d.hours=l[4],this.$d.minutes=l[5],this.$d.seconds=l[6],this.calMilliseconds(),this}}return this}var v=Y.prototype;return v.calMilliseconds=function(){var k=this;this.$ms=Object.keys(this.$d).reduce((function(f,p){return f+(k.$d[p]||0)*O[p]}),0)},v.parseFromMilliseconds=function(){var k=this.$ms;this.$d.years=M(k/A),k%=A,this.$d.months=M(k/E),k%=E,this.$d.days=M(k/S),k%=S,this.$d.hours=M(k/T),k%=T,this.$d.minutes=M(k/m),k%=m,this.$d.seconds=M(k/r),k%=r,this.$d.milliseconds=k},v.toISOString=function(){var k=I(this.$d.years,"Y"),f=I(this.$d.months,"M"),p=+this.$d.days||0;this.$d.weeks&&(p+=7*this.$d.weeks);var g=I(p,"D"),a=I(this.$d.hours,"H"),l=I(this.$d.minutes,"M"),y=this.$d.seconds||0;this.$d.milliseconds&&(y+=this.$d.milliseconds/1e3,y=Math.round(1e3*y)/1e3);var h=I(y,"S"),d=k.negative||f.negative||g.negative||a.negative||l.negative||h.negative,_=a.format||l.format||h.format?"T":"",i=(d?"-":"")+"P"+k.format+f.format+g.format+_+a.format+l.format+h.format;return i==="P"||i==="-P"?"P0D":i},v.toJSON=function(){return this.toISOString()},v.format=function(k){var f=k||"YYYY-MM-DDTHH:mm:ss",p={Y:this.$d.years,YY:e.s(this.$d.years,2,"0"),YYYY:e.s(this.$d.years,4,"0"),M:this.$d.months,MM:e.s(this.$d.months,2,"0"),D:this.$d.days,DD:e.s(this.$d.days,2,"0"),H:this.$d.hours,HH:e.s(this.$d.hours,2,"0"),m:this.$d.minutes,mm:e.s(this.$d.minutes,2,"0"),s:this.$d.seconds,ss:e.s(this.$d.seconds,2,"0"),SSS:e.s(this.$d.milliseconds,3,"0")};return f.replace(L,(function(g,a){return a||String(p[g])}))},v.as=function(k){return this.$ms/O[C(k)]},v.get=function(k){var f=this.$ms,p=C(k);return p==="milliseconds"?f%=1e3:f=p==="weeks"?M(f/O[p]):this.$d[p],f||0},v.add=function(k,f,p){var g;return g=f?k*O[C(f)]:z(k)?k.$ms:P(k,this).$ms,P(this.$ms+g*(p?-1:1),this)},v.subtract=function(k,f){return this.add(k,f,!0)},v.locale=function(k){var f=this.clone();return f.$l=k,f},v.clone=function(){return P(this.$ms,this)},v.humanize=function(k){return n().add(this.$ms,"ms").locale(this.$l).fromNow(!k)},v.valueOf=function(){return this.asMilliseconds()},v.milliseconds=function(){return this.get("milliseconds")},v.asMilliseconds=function(){return this.as("milliseconds")},v.seconds=function(){return this.get("seconds")},v.asSeconds=function(){return this.as("seconds")},v.minutes=function(){return this.get("minutes")},v.asMinutes=function(){return this.as("minutes")},v.hours=function(){return this.get("hours")},v.asHours=function(){return this.as("hours")},v.days=function(){return this.get("days")},v.asDays=function(){return this.as("days")},v.weeks=function(){return this.get("weeks")},v.asWeeks=function(){return this.as("weeks")},v.months=function(){return this.get("months")},v.asMonths=function(){return this.as("months")},v.years=function(){return this.get("years")},v.asYears=function(){return this.as("years")},Y})(),j=function(Y,v,k){return Y.add(v.years()*k,"y").add(v.months()*k,"M").add(v.days()*k,"d").add(v.hours()*k,"h").add(v.minutes()*k,"m").add(v.seconds()*k,"s").add(v.milliseconds()*k,"ms")};return function(Y,v,k){n=k,e=k().$utils(),k.duration=function(g,a){return P(g,{$l:k.locale()},a)},k.isDuration=z;var f=v.prototype.add,p=v.prototype.subtract;v.prototype.add=function(g,a){return z(g)?j(this,g,1):f.bind(this)(g,a)},v.prototype.subtract=function(g,a){return z(g)?j(this,g,-1):p.bind(this)(g,a)}}}))}));function Rt(t,s,n){let e=!0;for(;e;)e=!1,n.forEach(function(r){const m="^\\s*"+r+"\\s*$",T=new RegExp(m);t[0].match(T)&&(s[r]=!0,t.shift(1),e=!0)})}var ue,q,de,fe,he,ht,me,St,ke,Ht,Z,Ct,Mt,Et,mt,kt,Yt,It,xt,rt,$t,Bt,Lt,at,yt,At,Ft,bt,Ot,ye,ge,pe,Te,ve,xe,be,_e,we,De,Se,Ce,Me,Ee,Ye,Ie,$e,Le,Ae,Fe,Oe,We,Ve,Pe,jt,Ne,ze,Re,Gt,He,Wt,qt,Xt,_t,ot,Be,je,Ut,Vt,H,Zt,Ge,it,qe,Qt,Xe,Kt,Ue,Jt,Ze,Qe,te,Ke,tt,Pt,Li,Ai=Je((()=>{Mi(),vi(),ai(),ue=Si(),q=dt(ie(),1),de=dt(Ei(),1),fe=dt(Yi(),1),he=dt(Ii(),1),ht=dt(ie(),1),me=dt($i(),1),mi(),St=(function(){var t=u(function(a,l,y,h){for(y=y||{},h=a.length;h--;y[a[h]]=l);return y},"o"),s=[6,8,10,12,13,14,15,16,17,18,20,21,22,23,24,25,26,27,28,29,30,31,33,35,36,38,40],n=[1,26],e=[1,27],r=[1,28],m=[1,29],T=[1,30],S=[1,31],A=[1,32],E=[1,33],D=[1,34],L=[1,9],O=[1,10],z=[1,11],P=[1,12],C=[1,13],b=[1,14],M=[1,15],F=[1,16],I=[1,19],B=[1,20],j=[1,21],Y=[1,22],v=[1,23],k=[1,25],f=[1,35],p={trace:u(function(){},"trace"),yy:{},symbols_:{error:2,start:3,gantt:4,document:5,EOF:6,line:7,SPACE:8,statement:9,NL:10,weekday:11,weekday_monday:12,weekday_tuesday:13,weekday_wednesday:14,weekday_thursday:15,weekday_friday:16,weekday_saturday:17,weekday_sunday:18,weekend:19,weekend_friday:20,weekend_saturday:21,dateFormat:22,inclusiveEndDates:23,topAxis:24,axisFormat:25,tickInterval:26,excludes:27,includes:28,todayMarker:29,title:30,acc_title:31,acc_title_value:32,acc_descr:33,acc_descr_value:34,acc_descr_multiline_value:35,section:36,clickStatement:37,taskTxt:38,taskData:39,click:40,callbackname:41,callbackargs:42,href:43,clickStatementDebug:44,$accept:0,$end:1},terminals_:{2:"error",4:"gantt",6:"EOF",8:"SPACE",10:"NL",12:"weekday_monday",13:"weekday_tuesday",14:"weekday_wednesday",15:"weekday_thursday",16:"weekday_friday",17:"weekday_saturday",18:"weekday_sunday",20:"weekend_friday",21:"weekend_saturday",22:"dateFormat",23:"inclusiveEndDates",24:"topAxis",25:"axisFormat",26:"tickInterval",27:"excludes",28:"includes",29:"todayMarker",30:"title",31:"acc_title",32:"acc_title_value",33:"acc_descr",34:"acc_descr_value",35:"acc_descr_multiline_value",36:"section",38:"taskTxt",39:"taskData",40:"click",41:"callbackname",42:"callbackargs",43:"href"},productions_:[0,[3,3],[5,0],[5,2],[7,2],[7,1],[7,1],[7,1],[11,1],[11,1],[11,1],[11,1],[11,1],[11,1],[11,1],[19,1],[19,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,2],[9,2],[9,1],[9,1],[9,1],[9,2],[37,2],[37,3],[37,3],[37,4],[37,3],[37,4],[37,2],[44,2],[44,3],[44,3],[44,4],[44,3],[44,4],[44,2]],performAction:u(function(l,y,h,d,_,i,c){var o=i.length-1;switch(_){case 1:return i[o-1];case 2:this.$=[];break;case 3:i[o-1].push(i[o]),this.$=i[o-1];break;case 4:case 5:this.$=i[o];break;case 6:case 7:this.$=[];break;case 8:d.setWeekday("monday");break;case 9:d.setWeekday("tuesday");break;case 10:d.setWeekday("wednesday");break;case 11:d.setWeekday("thursday");break;case 12:d.setWeekday("friday");break;case 13:d.setWeekday("saturday");break;case 14:d.setWeekday("sunday");break;case 15:d.setWeekend("friday");break;case 16:d.setWeekend("saturday");break;case 17:d.setDateFormat(i[o].substr(11)),this.$=i[o].substr(11);break;case 18:d.enableInclusiveEndDates(),this.$=i[o].substr(18);break;case 19:d.TopAxis(),this.$=i[o].substr(8);break;case 20:d.setAxisFormat(i[o].substr(11)),this.$=i[o].substr(11);break;case 21:d.setTickInterval(i[o].substr(13)),this.$=i[o].substr(13);break;case 22:d.setExcludes(i[o].substr(9)),this.$=i[o].substr(9);break;case 23:d.setIncludes(i[o].substr(9)),this.$=i[o].substr(9);break;case 24:d.setTodayMarker(i[o].substr(12)),this.$=i[o].substr(12);break;case 27:d.setDiagramTitle(i[o].substr(6)),this.$=i[o].substr(6);break;case 28:this.$=i[o].trim(),d.setAccTitle(this.$);break;case 29:case 30:this.$=i[o].trim(),d.setAccDescription(this.$);break;case 31:d.addSection(i[o].substr(8)),this.$=i[o].substr(8);break;case 33:d.addTask(i[o-1],i[o]),this.$="task";break;case 34:this.$=i[o-1],d.setClickEvent(i[o-1],i[o],null);break;case 35:this.$=i[o-2],d.setClickEvent(i[o-2],i[o-1],i[o]);break;case 36:this.$=i[o-2],d.setClickEvent(i[o-2],i[o-1],null),d.setLink(i[o-2],i[o]);break;case 37:this.$=i[o-3],d.setClickEvent(i[o-3],i[o-2],i[o-1]),d.setLink(i[o-3],i[o]);break;case 38:this.$=i[o-2],d.setClickEvent(i[o-2],i[o],null),d.setLink(i[o-2],i[o-1]);break;case 39:this.$=i[o-3],d.setClickEvent(i[o-3],i[o-1],i[o]),d.setLink(i[o-3],i[o-2]);break;case 40:this.$=i[o-1],d.setLink(i[o-1],i[o]);break;case 41:case 47:this.$=i[o-1]+" "+i[o];break;case 42:case 43:case 45:this.$=i[o-2]+" "+i[o-1]+" "+i[o];break;case 44:case 46:this.$=i[o-3]+" "+i[o-2]+" "+i[o-1]+" "+i[o];break}},"anonymous"),table:[{3:1,4:[1,2]},{1:[3]},t(s,[2,2],{5:3}),{6:[1,4],7:5,8:[1,6],9:7,10:[1,8],11:17,12:n,13:e,14:r,15:m,16:T,17:S,18:A,19:18,20:E,21:D,22:L,23:O,24:z,25:P,26:C,27:b,28:M,29:F,30:I,31:B,33:j,35:Y,36:v,37:24,38:k,40:f},t(s,[2,7],{1:[2,1]}),t(s,[2,3]),{9:36,11:17,12:n,13:e,14:r,15:m,16:T,17:S,18:A,19:18,20:E,21:D,22:L,23:O,24:z,25:P,26:C,27:b,28:M,29:F,30:I,31:B,33:j,35:Y,36:v,37:24,38:k,40:f},t(s,[2,5]),t(s,[2,6]),t(s,[2,17]),t(s,[2,18]),t(s,[2,19]),t(s,[2,20]),t(s,[2,21]),t(s,[2,22]),t(s,[2,23]),t(s,[2,24]),t(s,[2,25]),t(s,[2,26]),t(s,[2,27]),{32:[1,37]},{34:[1,38]},t(s,[2,30]),t(s,[2,31]),t(s,[2,32]),{39:[1,39]},t(s,[2,8]),t(s,[2,9]),t(s,[2,10]),t(s,[2,11]),t(s,[2,12]),t(s,[2,13]),t(s,[2,14]),t(s,[2,15]),t(s,[2,16]),{41:[1,40],43:[1,41]},t(s,[2,4]),t(s,[2,28]),t(s,[2,29]),t(s,[2,33]),t(s,[2,34],{42:[1,42],43:[1,43]}),t(s,[2,40],{41:[1,44]}),t(s,[2,35],{43:[1,45]}),t(s,[2,36]),t(s,[2,38],{42:[1,46]}),t(s,[2,37]),t(s,[2,39])],defaultActions:{},parseError:u(function(l,y){if(y.recoverable)this.trace(l);else{var h=new Error(l);throw h.hash=y,h}},"parseError"),parse:u(function(l){var y=this,h=[0],d=[],_=[null],i=[],c=this.table,o="",x=0,$=0,w=0,W=2,V=1,gt=i.slice.call(arguments,1),N=Object.create(this.lexer),K={yy:{}};for(var ct in this.yy)Object.prototype.hasOwnProperty.call(this.yy,ct)&&(K.yy[ct]=this.yy[ct]);N.setInput(l,K.yy),K.yy.lexer=N,K.yy.parser=this,typeof N.yylloc>"u"&&(N.yylloc={});var lt=N.yylloc;i.push(lt);var pt=N.options&&N.options.ranges;typeof K.yy.parseError=="function"?this.parseError=K.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;function Tt(X){h.length=h.length-2*X,_.length=_.length-X,i.length=i.length-X}u(Tt,"popStack");function ut(){var X=d.pop()||N.lex()||V;return typeof X!="number"&&(X instanceof Array&&(d=X,X=d.pop()),X=y.symbols_[X]||X),X}u(ut,"lex");for(var R,et,U,G,st,Q={},vt,J,ee,wt;;){if(U=h[h.length-1],this.defaultActions[U]?G=this.defaultActions[U]:((R===null||typeof R>"u")&&(R=ut()),G=c[U]&&c[U][R]),typeof G>"u"||!G.length||!G[0]){var zt="";wt=[];for(vt in c[U])this.terminals_[vt]&&vt>W&&wt.push("'"+this.terminals_[vt]+"'");N.showPosition?zt="Parse error on line "+(x+1)+`:
`+N.showPosition()+`
Expecting `+wt.join(", ")+", got '"+(this.terminals_[R]||R)+"'":zt="Parse error on line "+(x+1)+": Unexpected "+(R==V?"end of input":"'"+(this.terminals_[R]||R)+"'"),this.parseError(zt,{text:N.match,token:this.terminals_[R]||R,line:N.yylineno,loc:lt,expected:wt})}if(G[0]instanceof Array&&G.length>1)throw new Error("Parse Error: multiple actions possible at state: "+U+", token: "+R);switch(G[0]){case 1:h.push(R),_.push(N.yytext),i.push(N.yylloc),h.push(G[1]),R=null,et?(R=et,et=null):($=N.yyleng,o=N.yytext,x=N.yylineno,lt=N.yylloc,w>0&&w--);break;case 2:if(J=this.productions_[G[1]][1],Q.$=_[_.length-J],Q._$={first_line:i[i.length-(J||1)].first_line,last_line:i[i.length-1].last_line,first_column:i[i.length-(J||1)].first_column,last_column:i[i.length-1].last_column},pt&&(Q._$.range=[i[i.length-(J||1)].range[0],i[i.length-1].range[1]]),st=this.performAction.apply(Q,[o,$,x,K.yy,G[1],_,i].concat(gt)),typeof st<"u")return st;J&&(h=h.slice(0,-1*J*2),_=_.slice(0,-1*J),i=i.slice(0,-1*J)),h.push(this.productions_[G[1]][0]),_.push(Q.$),i.push(Q._$),ee=c[h[h.length-2]][h[h.length-1]],h.push(ee);break;case 3:return!0}}return!0},"parse")};p.lexer=(function(){return{EOF:1,parseError:u(function(l,y){if(this.yy.parser)this.yy.parser.parseError(l,y);else throw new Error(l)},"parseError"),setInput:u(function(a,l){return this.yy=l||this.yy||{},this._input=a,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},"setInput"),input:u(function(){var a=this._input[0];return this.yytext+=a,this.yyleng++,this.offset++,this.match+=a,this.matched+=a,a.match(/(?:\r\n?|\n).*/g)?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),a},"input"),unput:u(function(a){var l=a.length,y=a.split(/(?:\r\n?|\n)/g);this._input=a+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-l),this.offset-=l;var h=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),y.length-1&&(this.yylineno-=y.length-1);var d=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:y?(y.length===h.length?this.yylloc.first_column:0)+h[h.length-y.length].length-y[0].length:this.yylloc.first_column-l},this.options.ranges&&(this.yylloc.range=[d[0],d[0]+this.yyleng-l]),this.yyleng=this.yytext.length,this},"unput"),more:u(function(){return this._more=!0,this},"more"),reject:u(function(){if(this.options.backtrack_lexer)this._backtrack=!0;else return this.parseError("Lexical error on line "+(this.yylineno+1)+`. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).
`+this.showPosition(),{text:"",token:null,line:this.yylineno});return this},"reject"),less:u(function(a){this.unput(this.match.slice(a))},"less"),pastInput:u(function(){var a=this.matched.substr(0,this.matched.length-this.match.length);return(a.length>20?"...":"")+a.substr(-20).replace(/\n/g,"")},"pastInput"),upcomingInput:u(function(){var a=this.match;return a.length<20&&(a+=this._input.substr(0,20-a.length)),(a.substr(0,20)+(a.length>20?"...":"")).replace(/\n/g,"")},"upcomingInput"),showPosition:u(function(){var a=this.pastInput(),l=new Array(a.length+1).join("-");return a+this.upcomingInput()+`
`+l+"^"},"showPosition"),test_match:u(function(a,l){var y,h,d;if(this.options.backtrack_lexer&&(d={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(d.yylloc.range=this.yylloc.range.slice(0))),h=a[0].match(/(?:\r\n?|\n).*/g),h&&(this.yylineno+=h.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:h?h[h.length-1].length-h[h.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+a[0].length},this.yytext+=a[0],this.match+=a[0],this.matches=a,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(a[0].length),this.matched+=a[0],y=this.performAction.call(this,this.yy,this,l,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),y)return y;if(this._backtrack){for(var _ in d)this[_]=d[_];return!1}return!1},"test_match"),next:u(function(){if(this.done)return this.EOF;this._input||(this.done=!0);var a,l,y,h;this._more||(this.yytext="",this.match="");for(var d=this._currentRules(),_=0;_<d.length;_++)if(y=this._input.match(this.rules[d[_]]),y&&(!l||y[0].length>l[0].length)){if(l=y,h=_,this.options.backtrack_lexer){if(a=this.test_match(y,d[_]),a!==!1)return a;if(this._backtrack){l=!1;continue}else return!1}else if(!this.options.flex)break}return l?(a=this.test_match(l,d[h]),a!==!1?a:!1):this._input===""?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+`. Unrecognized text.
`+this.showPosition(),{text:"",token:null,line:this.yylineno})},"next"),lex:u(function(){var l=this.next();return l||this.lex()},"lex"),begin:u(function(l){this.conditionStack.push(l)},"begin"),popState:u(function(){return this.conditionStack.length-1>0?this.conditionStack.pop():this.conditionStack[0]},"popState"),_currentRules:u(function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},"_currentRules"),topState:u(function(l){return l=this.conditionStack.length-1-Math.abs(l||0),l>=0?this.conditionStack[l]:"INITIAL"},"topState"),pushState:u(function(l){this.begin(l)},"pushState"),stateStackSize:u(function(){return this.conditionStack.length},"stateStackSize"),options:{"case-insensitive":!0},performAction:u(function(l,y,h,d){switch(h){case 0:return this.begin("open_directive"),"open_directive";case 1:return this.begin("acc_title"),31;case 2:return this.popState(),"acc_title_value";case 3:return this.begin("acc_descr"),33;case 4:return this.popState(),"acc_descr_value";case 5:this.begin("acc_descr_multiline");break;case 6:this.popState();break;case 7:return"acc_descr_multiline_value";case 8:break;case 9:break;case 10:break;case 11:return 10;case 12:break;case 13:break;case 14:this.begin("href");break;case 15:this.popState();break;case 16:return 43;case 17:this.begin("callbackname");break;case 18:this.popState();break;case 19:this.popState(),this.begin("callbackargs");break;case 20:return 41;case 21:this.popState();break;case 22:return 42;case 23:this.begin("click");break;case 24:this.popState();break;case 25:return 40;case 26:return 4;case 27:return 22;case 28:return 23;case 29:return 24;case 30:return 25;case 31:return 26;case 32:return 28;case 33:return 27;case 34:return 29;case 35:return 12;case 36:return 13;case 37:return 14;case 38:return 15;case 39:return 16;case 40:return 17;case 41:return 18;case 42:return 20;case 43:return 21;case 44:return"date";case 45:return 30;case 46:return"accDescription";case 47:return 36;case 48:return 38;case 49:return 39;case 50:return":";case 51:return 6;case 52:return"INVALID"}},"anonymous"),rules:[/^(?:%%\{)/i,/^(?:accTitle\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*\{\s*)/i,/^(?:[\}])/i,/^(?:[^\}]*)/i,/^(?:%%(?!\{)*[^\n]*)/i,/^(?:[^\}]%%*[^\n]*)/i,/^(?:%%*[^\n]*[\n]*)/i,/^(?:[\n]+)/i,/^(?:\s+)/i,/^(?:%[^\n]*)/i,/^(?:href[\s]+["])/i,/^(?:["])/i,/^(?:[^"]*)/i,/^(?:call[\s]+)/i,/^(?:\([\s]*\))/i,/^(?:\()/i,/^(?:[^(]*)/i,/^(?:\))/i,/^(?:[^)]*)/i,/^(?:click[\s]+)/i,/^(?:[\s\n])/i,/^(?:[^\s\n]*)/i,/^(?:gantt\b)/i,/^(?:dateFormat\s[^#\n;]+)/i,/^(?:inclusiveEndDates\b)/i,/^(?:topAxis\b)/i,/^(?:axisFormat\s[^#\n;]+)/i,/^(?:tickInterval\s[^#\n;]+)/i,/^(?:includes\s[^#\n;]+)/i,/^(?:excludes\s[^#\n;]+)/i,/^(?:todayMarker\s[^\n;]+)/i,/^(?:weekday\s+monday\b)/i,/^(?:weekday\s+tuesday\b)/i,/^(?:weekday\s+wednesday\b)/i,/^(?:weekday\s+thursday\b)/i,/^(?:weekday\s+friday\b)/i,/^(?:weekday\s+saturday\b)/i,/^(?:weekday\s+sunday\b)/i,/^(?:weekend\s+friday\b)/i,/^(?:weekend\s+saturday\b)/i,/^(?:\d\d\d\d-\d\d-\d\d\b)/i,/^(?:title\s[^\n]+)/i,/^(?:accDescription\s[^#\n;]+)/i,/^(?:section\s[^\n]+)/i,/^(?:[^:\n]+)/i,/^(?::[^#\n;]+)/i,/^(?::)/i,/^(?:$)/i,/^(?:.)/i],conditions:{acc_descr_multiline:{rules:[6,7],inclusive:!1},acc_descr:{rules:[4],inclusive:!1},acc_title:{rules:[2],inclusive:!1},callbackargs:{rules:[21,22],inclusive:!1},callbackname:{rules:[18,19,20],inclusive:!1},href:{rules:[15,16],inclusive:!1},click:{rules:[24,25],inclusive:!1},INITIAL:{rules:[0,1,3,5,8,9,10,11,12,13,14,17,23,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52],inclusive:!0}}}})();function g(){this.yy={}}return u(g,"Parser"),g.prototype=p,p.Parser=g,new g})(),St.parser=St,ke=St,q.default.extend(de.default),q.default.extend(fe.default),q.default.extend(he.default),Ht={friday:5,saturday:6},Z="",Ct="",Mt=void 0,Et="",mt=[],kt=[],Yt=new Map,It=[],xt=[],rt="",$t="",Bt=["active","done","crit","milestone","vert"],Lt=[],at="",yt=!1,At=!1,Ft="sunday",bt="saturday",Ot=0,ye=u(function(){It=[],xt=[],rt="",Lt=[],_t=0,Ut=void 0,Vt=void 0,H=[],Z="",Ct="",$t="",Mt=void 0,Et="",mt=[],kt=[],yt=!1,At=!1,Ot=0,Yt=new Map,at="",pi(),Ft="sunday",bt="saturday"},"clear"),ge=u(function(t){at=t},"setDiagramId"),pe=u(function(t){Ct=t},"setAxisFormat"),Te=u(function(){return Ct},"getAxisFormat"),ve=u(function(t){Mt=t},"setTickInterval"),xe=u(function(){return Mt},"getTickInterval"),be=u(function(t){Et=t},"setTodayMarker"),_e=u(function(){return Et},"getTodayMarker"),we=u(function(t){Z=t},"setDateFormat"),De=u(function(){yt=!0},"enableInclusiveEndDates"),Se=u(function(){return yt},"endDatesAreInclusive"),Ce=u(function(){At=!0},"enableTopAxis"),Me=u(function(){return At},"topAxisEnabled"),Ee=u(function(t){$t=t},"setDisplayMode"),Ye=u(function(){return $t},"getDisplayMode"),Ie=u(function(){return Z},"getDateFormat"),$e=u(function(t){mt=t.toLowerCase().split(/[\s,]+/)},"setIncludes"),Le=u(function(){return mt},"getIncludes"),Ae=u(function(t){kt=t.toLowerCase().split(/[\s,]+/)},"setExcludes"),Fe=u(function(){return kt},"getExcludes"),Oe=u(function(){return Yt},"getLinks"),We=u(function(t){rt=t,It.push(t)},"addSection"),Ve=u(function(){return It},"getSections"),Pe=u(function(){let t=Qt();const s=10;let n=0;for(;!t&&n<s;)t=Qt(),n++;return xt=H,xt},"getTasks"),jt=u(function(t,s,n,e){const r=t.format(s.trim()),m=t.format("YYYY-MM-DD");return e.includes(r)||e.includes(m)?!1:n.includes("weekends")&&(t.isoWeekday()===Ht[bt]||t.isoWeekday()===Ht[bt]+1)||n.includes(t.format("dddd").toLowerCase())?!0:n.includes(r)||n.includes(m)},"isInvalidDate"),Ne=u(function(t){Ft=t},"setWeekday"),ze=u(function(){return Ft},"getWeekday"),Re=u(function(t){bt=t},"setWeekend"),Gt=u(function(t,s,n,e){if(!n.length||t.manualEndTime)return;let r;t.startTime instanceof Date?r=(0,q.default)(t.startTime):r=(0,q.default)(t.startTime,s,!0),r=r.add(1,"d");let m;t.endTime instanceof Date?m=(0,q.default)(t.endTime):m=(0,q.default)(t.endTime,s,!0);const[T,S]=He(r,m,s,n,e);t.endTime=T.toDate(),t.renderEndTime=S},"checkTaskDates"),He=u(function(t,s,n,e,r){let m=!1,T=null;const S=s.add(1e4,"d");for(;t<=s;){if(m||(T=s.toDate()),m=jt(t,n,e,r),m&&(s=s.add(1,"d"),s>S))throw new Error("Failed to find a valid date that was not excluded by `excludes` after 10,000 iterations.");t=t.add(1,"d")}return[s,T]},"fixTaskDates"),Wt=u(function(t,s,n){if(n=n.trim(),u(m=>{const T=m.trim();return T==="x"||T==="X"},"isTimestampFormat")(s)&&/^\d+$/.test(n))return new Date(Number(n));const e=/^after\s+(?<ids>[\d\w- ]+)/.exec(n);if(e!==null){let m=null;for(const S of e.groups.ids.split(" ")){let A=it(S);A!==void 0&&(!m||A.endTime>m.endTime)&&(m=A)}if(m)return m.endTime;const T=new Date;return T.setHours(0,0,0,0),T}let r=(0,q.default)(n,s.trim(),!0);if(r.isValid())return r.toDate();{nt.debug("Invalid date:"+n),nt.debug("With date format:"+s.trim());const m=new Date(n);if(m===void 0||isNaN(m.getTime())||m.getFullYear()<-1e4||m.getFullYear()>1e4)throw new Error("Invalid date:"+n);return m}},"getStartDate"),qt=u(function(t){const s=/^(\d+(?:\.\d+)?)([Mdhmswy]|ms)$/.exec(t.trim());return s!==null?[Number.parseFloat(s[1]),s[2]]:[NaN,"ms"]},"parseDuration"),Xt=u(function(t,s,n,e=!1){n=n.trim();const r=/^until\s+(?<ids>[\d\w- ]+)/.exec(n);if(r!==null){let E=null;for(const L of r.groups.ids.split(" ")){let O=it(L);O!==void 0&&(!E||O.startTime<E.startTime)&&(E=O)}if(E)return E.startTime;const D=new Date;return D.setHours(0,0,0,0),D}let m=(0,q.default)(n,s.trim(),!0);if(m.isValid())return e&&(m=m.add(1,"d")),m.toDate();let T=(0,q.default)(t);const[S,A]=qt(n);if(!Number.isNaN(S)){const E=T.add(S,A);E.isValid()&&(T=E)}return T.toDate()},"getEndDate"),_t=0,ot=u(function(t){return t===void 0?(_t=_t+1,"task"+_t):t},"parseId"),Be=u(function(t,s){let n;s.substr(0,1)===":"?n=s.substr(1,s.length):n=s;const e=n.split(","),r={};Rt(e,r,Bt);for(let T=0;T<e.length;T++)e[T]=e[T].trim();let m="";switch(e.length){case 1:r.id=ot(),r.startTime=t.endTime,m=e[0];break;case 2:r.id=ot(),r.startTime=Wt(void 0,Z,e[0]),m=e[1];break;case 3:r.id=ot(e[0]),r.startTime=Wt(void 0,Z,e[1]),m=e[2];break;default:}return m&&(r.endTime=Xt(r.startTime,Z,m,yt),r.manualEndTime=(0,q.default)(m,"YYYY-MM-DD",!0).isValid(),Gt(r,Z,kt,mt)),r},"compileData"),je=u(function(t,s){let n;s.substr(0,1)===":"?n=s.substr(1,s.length):n=s;const e=n.split(","),r={};Rt(e,r,Bt);for(let m=0;m<e.length;m++)e[m]=e[m].trim();switch(e.length){case 1:r.id=ot(),r.startTime={type:"prevTaskEnd",id:t},r.endTime={data:e[0]};break;case 2:r.id=ot(),r.startTime={type:"getStartDate",startData:e[0]},r.endTime={data:e[1]};break;case 3:r.id=ot(e[0]),r.startTime={type:"getStartDate",startData:e[1]},r.endTime={data:e[2]};break;default:}return r},"parseData"),H=[],Zt={},Ge=u(function(t,s){const n={section:rt,type:rt,processed:!1,manualEndTime:!1,renderEndTime:null,raw:{data:s},task:t,classes:[]},e=je(Vt,s);n.raw.startTime=e.startTime,n.raw.endTime=e.endTime,n.id=e.id,n.prevTaskId=Vt,n.active=e.active,n.done=e.done,n.crit=e.crit,n.milestone=e.milestone,n.vert=e.vert,n.order=Ot,Ot++;const r=H.push(n);Vt=n.id,Zt[n.id]=r-1},"addTask"),it=u(function(t){const s=Zt[t];return H[s]},"findTaskById"),qe=u(function(t,s){const n={section:rt,type:rt,description:t,task:t,classes:[]},e=Be(Ut,s);n.startTime=e.startTime,n.endTime=e.endTime,n.id=e.id,n.active=e.active,n.done=e.done,n.crit=e.crit,n.milestone=e.milestone,n.vert=e.vert,Ut=n,xt.push(n)},"addTaskOrg"),Qt=u(function(){const t=u(function(n){const e=H[n];let r="";switch(H[n].raw.startTime.type){case"prevTaskEnd":e.startTime=it(e.prevTaskId).endTime;break;case"getStartDate":r=Wt(void 0,Z,H[n].raw.startTime.startData),r&&(H[n].startTime=r);break}return H[n].startTime&&(H[n].endTime=Xt(H[n].startTime,Z,H[n].raw.endTime.data,yt),H[n].endTime&&(H[n].processed=!0,H[n].manualEndTime=(0,q.default)(H[n].raw.endTime.data,"YYYY-MM-DD",!0).isValid(),Gt(H[n],Z,kt,mt))),H[n].processed},"compileTask");let s=!0;for(const[n,e]of H.entries())t(n),s=s&&e.processed;return s},"compileTasks"),Xe=u(function(t,s){let n=s;ft().securityLevel!=="loose"&&(n=(0,ue.sanitizeUrl)(s)),t.split(",").forEach(function(e){it(e)!==void 0&&(Jt(e,()=>{window.open(n,"_self")}),Yt.set(e,n))}),Kt(t,"clickable")},"setLink"),Kt=u(function(t,s){t.split(",").forEach(function(n){let e=it(n);e!==void 0&&e.classes.push(s)})},"setClass"),Ue=u(function(t,s,n){if(ft().securityLevel!=="loose"||s===void 0)return;let e=[];if(typeof n=="string"){e=n.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);for(let r=0;r<e.length;r++){let m=e[r].trim();m.startsWith('"')&&m.endsWith('"')&&(m=m.substr(1,m.length-2)),e[r]=m}}e.length===0&&e.push(t),it(t)!==void 0&&Jt(t,()=>{Ci.runFunc(s,...e)})},"setClickFun"),Jt=u(function(t,s){Lt.push(function(){const n=at?`${at}-${t}`:t,e=document.querySelector(`[id="${n}"]`);e!==null&&e.addEventListener("click",function(){s()})},function(){const n=at?`${at}-${t}`:t,e=document.querySelector(`[id="${n}-text"]`);e!==null&&e.addEventListener("click",function(){s()})})},"pushFun"),Ze={getConfig:u(()=>ft().gantt,"getConfig"),clear:ye,setDateFormat:we,getDateFormat:Ie,enableInclusiveEndDates:De,endDatesAreInclusive:Se,enableTopAxis:Ce,topAxisEnabled:Me,setAxisFormat:pe,getAxisFormat:Te,setTickInterval:ve,getTickInterval:xe,setTodayMarker:be,getTodayMarker:_e,setAccTitle:gi,getAccTitle:Di,setDiagramTitle:xi,getDiagramTitle:wi,setDiagramId:ge,setDisplayMode:Ee,getDisplayMode:Ye,setAccDescription:yi,getAccDescription:_i,addSection:We,getSections:Ve,getTasks:Pe,addTask:Ge,findTaskById:it,addTaskOrg:qe,setIncludes:$e,getIncludes:Le,setExcludes:Ae,getExcludes:Fe,setClickEvent:u(function(t,s,n){t.split(",").forEach(function(e){Ue(e,s,n)}),Kt(t,"clickable")},"setClickEvent"),setLink:Xe,getLinks:Oe,bindFunctions:u(function(t){Lt.forEach(function(s){s(t)})},"bindFunctions"),parseDuration:qt,isInvalidDate:jt,setWeekday:Ne,getWeekday:ze,setWeekend:Re},u(Rt,"getTaskTags"),ht.default.extend(me.default),Qe=u(function(){nt.debug("Something is calling, setConf, remove the call")},"setConf"),te={monday:li,tuesday:ui,wednesday:ci,thursday:hi,friday:ti,saturday:ki,sunday:di},Ke=u((t,s)=>{let n=[...t].map(()=>-1/0),e=[...t].sort((m,T)=>m.startTime-T.startTime||m.order-T.order),r=0;for(const m of e)for(let T=0;T<n.length;T++)if(m.startTime>=n[T]){n[T]=m.endTime,m.order=T+s,T>r&&(r=T);break}return r},"getMaxIntersections"),Pt=1e4,Li={parser:ke,db:Ze,renderer:{setConf:Qe,draw:u(function(t,s,n,e){const r=ft().gantt;e.db.setDiagramId(s);const m=ft().securityLevel;let T;m==="sandbox"&&(T=Dt("#i"+s));const S=m==="sandbox"?Dt(T.nodes()[0].contentDocument.body):Dt("body"),A=m==="sandbox"?T.nodes()[0].contentDocument:document,E=A.getElementById(s);tt=E.parentElement.offsetWidth,tt===void 0&&(tt=1200),r.useWidth!==void 0&&(tt=r.useWidth);const D=e.db.getTasks();let L=[];for(const f of D)L.push(f.type);L=k(L);const O={};let z=2*r.topPadding;if(e.db.getDisplayMode()==="compact"||r.displayMode==="compact"){const f={};for(const g of D)f[g.section]===void 0?f[g.section]=[g]:f[g.section].push(g);let p=0;for(const g of Object.keys(f)){const a=Ke(f[g],p)+1;p+=a,z+=a*(r.barHeight+r.barGap),O[g]=a}}else{z+=D.length*(r.barHeight+r.barGap);for(const f of L)O[f]=D.filter(p=>p.type===f).length}E.setAttribute("viewBox","0 0 "+tt+" "+z);const P=S.select(`[id="${s}"]`),C=fi().domain([ei(D,function(f){return f.startTime}),ri(D,function(f){return f.endTime})]).rangeRound([0,tt-r.leftPadding-r.rightPadding]);function b(f,p){const g=f.startTime,a=p.startTime;let l=0;return g>a?l=1:g<a&&(l=-1),l}u(b,"taskCompare"),D.sort(b),M(D,tt,z),Ti(P,z,tt,r.useMaxWidth),P.append("text").text(e.db.getDiagramTitle()).attr("x",tt/2).attr("y",r.titleTopMargin).attr("class","titleText");function M(f,p,g){const a=r.barHeight,l=a+r.barGap,y=r.topPadding,h=r.leftPadding,d=oi().domain([0,L.length]).range(["#00B9FA","#F95002"]).interpolate(ni);I(l,y,h,p,g,f,e.db.getExcludes(),e.db.getIncludes()),j(h,y,p,g),F(f,l,y,h,a,d,p,g),Y(l,y,h,a,d),v(h,y,p,g)}u(M,"makeGantt");function F(f,p,g,a,l,y,h){f.sort((c,o)=>c.vert===o.vert?0:c.vert?1:-1);const d=[...new Set(f.map(c=>c.order))].map(c=>f.find(o=>o.order===c));P.append("g").selectAll("rect").data(d).enter().append("rect").attr("x",0).attr("y",function(c,o){return o=c.order,o*p+g-2}).attr("width",function(){return h-r.rightPadding/2}).attr("height",p).attr("class",function(c){for(const[o,x]of L.entries())if(c.type===x)return"section section"+o%r.numberSectionStyles;return"section section0"}).enter();const _=P.append("g").selectAll("rect").data(f).enter(),i=e.db.getLinks();if(_.append("rect").attr("id",function(c){return s+"-"+c.id}).attr("rx",3).attr("ry",3).attr("x",function(c){return c.milestone?C(c.startTime)+a+.5*(C(c.endTime)-C(c.startTime))-.5*l:C(c.startTime)+a}).attr("y",function(c,o){return o=c.order,c.vert?r.gridLineStartPadding:o*p+g}).attr("width",function(c){return c.milestone?l:c.vert?.08*l:C(c.renderEndTime||c.endTime)-C(c.startTime)}).attr("height",function(c){return c.vert?D.length*(r.barHeight+r.barGap)+r.barHeight*2:l}).attr("transform-origin",function(c,o){return o=c.order,(C(c.startTime)+a+.5*(C(c.endTime)-C(c.startTime))).toString()+"px "+(o*p+g+.5*l).toString()+"px"}).attr("class",function(c){const o="task";let x="";c.classes.length>0&&(x=c.classes.join(" "));let $=0;for(const[W,V]of L.entries())c.type===V&&($=W%r.numberSectionStyles);let w="";return c.active?c.crit?w+=" activeCrit":w=" active":c.done?c.crit?w=" doneCrit":w=" done":c.crit&&(w+=" crit"),w.length===0&&(w=" task"),c.milestone&&(w=" milestone "+w),c.vert&&(w=" vert "+w),w+=$,w+=" "+x,o+w}),_.append("text").attr("id",function(c){return s+"-"+c.id+"-text"}).text(function(c){return c.task}).attr("font-size",r.fontSize).attr("x",function(c){let o=C(c.startTime),x=C(c.renderEndTime||c.endTime);if(c.milestone&&(o+=.5*(C(c.endTime)-C(c.startTime))-.5*l,x=o+l),c.vert)return C(c.startTime)+a;const $=this.getBBox().width;return $>x-o?x+$+1.5*r.leftPadding>h?o+a-5:x+a+5:(x-o)/2+o+a}).attr("y",function(c,o){return c.vert?r.gridLineStartPadding+D.length*(r.barHeight+r.barGap)+60:(o=c.order,o*p+r.barHeight/2+(r.fontSize/2-2)+g)}).attr("text-height",l).attr("class",function(c){const o=C(c.startTime);let x=C(c.endTime);c.milestone&&(x=o+l);const $=this.getBBox().width;let w="";c.classes.length>0&&(w=c.classes.join(" "));let W=0;for(const[gt,N]of L.entries())c.type===N&&(W=gt%r.numberSectionStyles);let V="";return c.active&&(c.crit?V="activeCritText"+W:V="activeText"+W),c.done?c.crit?V=V+" doneCritText"+W:V=V+" doneText"+W:c.crit&&(V=V+" critText"+W),c.milestone&&(V+=" milestoneText"),c.vert&&(V+=" vertText"),$>x-o?x+$+1.5*r.leftPadding>h?w+" taskTextOutsideLeft taskTextOutside"+W+" "+V:w+" taskTextOutsideRight taskTextOutside"+W+" "+V+" width-"+$:w+" taskText taskText"+W+" "+V+" width-"+$}),ft().securityLevel==="sandbox"){let c;c=Dt("#i"+s);const o=c.nodes()[0].contentDocument;_.filter(function(x){return i.has(x.id)}).each(function(x){var $=o.querySelector("#"+CSS.escape(s+"-"+x.id)),w=o.querySelector("#"+CSS.escape(s+"-"+x.id+"-text"));const W=$.parentNode;var V=o.createElement("a");V.setAttribute("xlink:href",i.get(x.id)),V.setAttribute("target","_top"),W.appendChild(V),V.appendChild($),V.appendChild(w)})}}u(F,"drawRects");function I(f,p,g,a,l,y,h,d){if(h.length===0&&d.length===0)return;let _,i;for(const{startTime:w,endTime:W}of y)(_===void 0||w<_)&&(_=w),(i===void 0||W>i)&&(i=W);if(!_||!i)return;if((0,ht.default)(i).diff((0,ht.default)(_),"year")>5){nt.warn("The difference between the min and max time is more than 5 years. This will cause performance issues. Skipping drawing exclude days.");return}const c=e.db.getDateFormat(),o=[];let x=null,$=(0,ht.default)(_);for(;$.valueOf()<=i;)e.db.isInvalidDate($,c,h,d)?x?x.end=$:x={start:$,end:$}:x&&(o.push(x),x=null),$=$.add(1,"d");P.append("g").selectAll("rect").data(o).enter().append("rect").attr("id",w=>s+"-exclude-"+w.start.format("YYYY-MM-DD")).attr("x",w=>C(w.start.startOf("day"))+g).attr("y",r.gridLineStartPadding).attr("width",w=>C(w.end.endOf("day"))-C(w.start.startOf("day"))).attr("height",l-p-r.gridLineStartPadding).attr("transform-origin",function(w,W){return(C(w.start)+g+.5*(C(w.end)-C(w.start))).toString()+"px "+(W*f+.5*l).toString()+"px"}).attr("class","exclude-range")}u(I,"drawExcludeDays");function B(f,p,g,a){if(g<=0||f>p)return 1/0;const l=p-f,y=ht.default.duration({[a??"day"]:g}).asMilliseconds();return y<=0?1/0:Math.ceil(l/y)}u(B,"getEstimatedTickCount");function j(f,p,g,a){const l=e.db.getDateFormat(),y=e.db.getAxisFormat();let h;y?h=y:l==="D"?h="%d":h=r.axisFormat??"%Y-%m-%d";let d=ii(C).tickSize(-a+p+r.gridLineStartPadding).tickFormat(se(h));const _=/^([1-9]\d*)(millisecond|second|minute|hour|day|week|month)$/.exec(e.db.getTickInterval()||r.tickInterval);if(_!==null){const i=parseInt(_[1],10);if(isNaN(i)||i<=0)nt.warn(`Invalid tick interval value: "${_[1]}". Skipping custom tick interval.`);else{const c=_[2],o=e.db.getWeekday()||r.weekday,x=C.domain(),$=x[0],w=x[1],W=B($,w,i,c);if(W>Pt)nt.warn(`The tick interval "${i}${c}" would generate ${W} ticks, which exceeds the maximum allowed (${Pt}). This may indicate an invalid date or time range. Skipping custom tick interval.`);else switch(c){case"millisecond":d.ticks(ae.every(i));break;case"second":d.ticks(ce.every(i));break;case"minute":d.ticks(re.every(i));break;case"hour":d.ticks(oe.every(i));break;case"day":d.ticks(le.every(i));break;case"week":d.ticks(te[o].every(i));break;case"month":d.ticks(ne.every(i));break}}}if(P.append("g").attr("class","grid").attr("transform","translate("+f+", "+(a-50)+")").call(d).selectAll("text").style("text-anchor","middle").attr("fill","#000").attr("stroke","none").attr("font-size",10).attr("dy","1em"),e.db.topAxisEnabled()||r.topAxis){let i=si(C).tickSize(-a+p+r.gridLineStartPadding).tickFormat(se(h));if(_!==null){const c=parseInt(_[1],10);if(isNaN(c)||c<=0)nt.warn(`Invalid tick interval value: "${_[1]}". Skipping custom tick interval.`);else{const o=_[2],x=e.db.getWeekday()||r.weekday,$=C.domain(),w=$[0],W=$[1];if(B(w,W,c,o)<=Pt)switch(o){case"millisecond":i.ticks(ae.every(c));break;case"second":i.ticks(ce.every(c));break;case"minute":i.ticks(re.every(c));break;case"hour":i.ticks(oe.every(c));break;case"day":i.ticks(le.every(c));break;case"week":i.ticks(te[x].every(c));break;case"month":i.ticks(ne.every(c));break}}}P.append("g").attr("class","grid").attr("transform","translate("+f+", "+p+")").call(i).selectAll("text").style("text-anchor","middle").attr("fill","#000").attr("stroke","none").attr("font-size",10)}}u(j,"makeGrid");function Y(f,p){let g=0;const a=Object.keys(O).map(l=>[l,O[l]]);P.append("g").selectAll("text").data(a).enter().append(function(l){const y=l[0].split(bi.lineBreakRegex),h=-(y.length-1)/2,d=A.createElementNS("http://www.w3.org/2000/svg","text");d.setAttribute("dy",h+"em");for(const[_,i]of y.entries()){const c=A.createElementNS("http://www.w3.org/2000/svg","tspan");c.setAttribute("alignment-baseline","central"),c.setAttribute("x","10"),_>0&&c.setAttribute("dy","1em"),c.textContent=i,d.appendChild(c)}return d}).attr("x",10).attr("y",function(l,y){if(y>0)for(let h=0;h<y;h++)return g+=a[y-1][1],l[1]*f/2+g*f+p;else return l[1]*f/2+p}).attr("font-size",r.sectionFontSize).attr("class",function(l){for(const[y,h]of L.entries())if(l[0]===h)return"sectionTitle sectionTitle"+y%r.numberSectionStyles;return"sectionTitle"})}u(Y,"vertLabels");function v(f,p,g,a){const l=e.db.getTodayMarker();if(l==="off")return;const y=P.append("g").attr("class","today"),h=new Date,d=y.append("line");d.attr("x1",C(h)+f).attr("x2",C(h)+f).attr("y1",r.titleTopMargin).attr("y2",a-r.titleTopMargin).attr("class","today"),l!==""&&d.attr("style",l.replace(/,/g,";"))}u(v,"drawToday");function k(f){const p={},g=[];for(let a=0,l=f.length;a<l;++a)Object.prototype.hasOwnProperty.call(p,f[a])||(p[f[a]]=!0,g.push(f[a]));return g}u(k,"checkUnique")},"draw")},styles:u(t=>`
  .mermaid-main-font {
        font-family: ${t.fontFamily};
  }

  .exclude-range {
    fill: ${t.excludeBkgColor};
  }

  .section {
    stroke: none;
    opacity: 0.2;
  }

  .section0 {
    fill: ${t.sectionBkgColor};
  }

  .section2 {
    fill: ${t.sectionBkgColor2};
  }

  .section1,
  .section3 {
    fill: ${t.altSectionBkgColor};
    opacity: 0.2;
  }

  .sectionTitle0 {
    fill: ${t.titleColor};
  }

  .sectionTitle1 {
    fill: ${t.titleColor};
  }

  .sectionTitle2 {
    fill: ${t.titleColor};
  }

  .sectionTitle3 {
    fill: ${t.titleColor};
  }

  .sectionTitle {
    text-anchor: start;
    font-family: ${t.fontFamily};
  }


  /* Grid and axis */

  .grid .tick {
    stroke: ${t.gridColor};
    opacity: 0.8;
    shape-rendering: crispEdges;
  }

  .grid .tick text {
    font-family: ${t.fontFamily};
    fill: ${t.textColor};
  }

  .grid path {
    stroke-width: 0;
  }


  /* Today line */

  .today {
    fill: none;
    stroke: ${t.todayLineColor};
    stroke-width: 2px;
  }


  /* Task styling */

  /* Default task */

  .task {
    stroke-width: 2;
  }

  .taskText {
    text-anchor: middle;
    font-family: ${t.fontFamily};
  }

  .taskTextOutsideRight {
    fill: ${t.taskTextDarkColor};
    text-anchor: start;
    font-family: ${t.fontFamily};
  }

  .taskTextOutsideLeft {
    fill: ${t.taskTextDarkColor};
    text-anchor: end;
  }


  /* Special case clickable */

  .task.clickable {
    cursor: pointer;
  }

  .taskText.clickable {
    cursor: pointer;
    fill: ${t.taskTextClickableColor} !important;
    font-weight: bold;
  }

  .taskTextOutsideLeft.clickable {
    cursor: pointer;
    fill: ${t.taskTextClickableColor} !important;
    font-weight: bold;
  }

  .taskTextOutsideRight.clickable {
    cursor: pointer;
    fill: ${t.taskTextClickableColor} !important;
    font-weight: bold;
  }


  /* Specific task settings for the sections*/

  .taskText0,
  .taskText1,
  .taskText2,
  .taskText3 {
    fill: ${t.taskTextColor};
  }

  .task0,
  .task1,
  .task2,
  .task3 {
    fill: ${t.taskBkgColor};
    stroke: ${t.taskBorderColor};
  }

  .taskTextOutside0,
  .taskTextOutside2
  {
    fill: ${t.taskTextOutsideColor};
  }

  .taskTextOutside1,
  .taskTextOutside3 {
    fill: ${t.taskTextOutsideColor};
  }


  /* Active task */

  .active0,
  .active1,
  .active2,
  .active3 {
    fill: ${t.activeTaskBkgColor};
    stroke: ${t.activeTaskBorderColor};
  }

  .activeText0,
  .activeText1,
  .activeText2,
  .activeText3 {
    fill: ${t.taskTextDarkColor} !important;
  }


  /* Completed task */

  .done0,
  .done1,
  .done2,
  .done3 {
    stroke: ${t.doneTaskBorderColor};
    fill: ${t.doneTaskBkgColor};
    stroke-width: 2;
  }

  .doneText0,
  .doneText1,
  .doneText2,
  .doneText3 {
    fill: ${t.taskTextDarkColor} !important;
  }

  /* Done task text displayed outside the bar sits against the diagram background,
     not against the done-task bar, so it must use the outside/contrast color. */
  .doneText0.taskTextOutsideLeft,
  .doneText0.taskTextOutsideRight,
  .doneText1.taskTextOutsideLeft,
  .doneText1.taskTextOutsideRight,
  .doneText2.taskTextOutsideLeft,
  .doneText2.taskTextOutsideRight,
  .doneText3.taskTextOutsideLeft,
  .doneText3.taskTextOutsideRight {
    fill: ${t.taskTextOutsideColor} !important;
  }


  /* Tasks on the critical line */

  .crit0,
  .crit1,
  .crit2,
  .crit3 {
    stroke: ${t.critBorderColor};
    fill: ${t.critBkgColor};
    stroke-width: 2;
  }

  .activeCrit0,
  .activeCrit1,
  .activeCrit2,
  .activeCrit3 {
    stroke: ${t.critBorderColor};
    fill: ${t.activeTaskBkgColor};
    stroke-width: 2;
  }

  .doneCrit0,
  .doneCrit1,
  .doneCrit2,
  .doneCrit3 {
    stroke: ${t.critBorderColor};
    fill: ${t.doneTaskBkgColor};
    stroke-width: 2;
    cursor: pointer;
    shape-rendering: crispEdges;
  }

  .milestone {
    transform: rotate(45deg) scale(0.8,0.8);
  }

  .milestoneText {
    font-style: italic;
  }
  .doneCritText0,
  .doneCritText1,
  .doneCritText2,
  .doneCritText3 {
    fill: ${t.taskTextDarkColor} !important;
  }

  /* Done-crit task text outside the bar — same reasoning as doneText above. */
  .doneCritText0.taskTextOutsideLeft,
  .doneCritText0.taskTextOutsideRight,
  .doneCritText1.taskTextOutsideLeft,
  .doneCritText1.taskTextOutsideRight,
  .doneCritText2.taskTextOutsideLeft,
  .doneCritText2.taskTextOutsideRight,
  .doneCritText3.taskTextOutsideLeft,
  .doneCritText3.taskTextOutsideRight {
    fill: ${t.taskTextOutsideColor} !important;
  }

  .vert {
    stroke: ${t.vertLineColor};
  }

  .vertText {
    font-size: 15px;
    text-anchor: middle;
    fill: ${t.vertLineColor} !important;
  }

  .activeCritText0,
  .activeCritText1,
  .activeCritText2,
  .activeCritText3 {
    fill: ${t.taskTextDarkColor} !important;
  }

  .titleText {
    text-anchor: middle;
    font-size: 18px;
    fill: ${t.titleColor||t.textColor};
    font-family: ${t.fontFamily};
  }
`,"getStyles")}}));Ai();export{Li as diagram};
