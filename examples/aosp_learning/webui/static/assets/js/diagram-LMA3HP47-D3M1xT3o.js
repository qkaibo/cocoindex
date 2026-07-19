import{xa as F}from"./index-tvYt9uZA.js";import{n as z,t as E}from"./mermaid-parser.core-5pN4YCMQ.js";import{Bt as m,Ht as x,Vt as W}from"./src-R1xd3Kus.js";import{U as H,W as M,a as U,b as Y,c as G,f as L,j as N,q as I,v as K,w as X,y as j}from"./chunk-CSCIHK7Q-W6Hogs-J.js";import{n as O,t as Q}from"./chunk-WU5MYG2G--30ohQ13.js";import{d as R,i as y}from"./chunk-5ZQYHXKU-Ku05N9PI.js";import{n as V,t as q}from"./chunk-4BX2VUAB-C2is6i4e.js";var u,B,b,_,C,$,w,v,S,A,D,J,Z=F((()=>{Q(),q(),R(),N(),W(),E(),B=L.packet,b=(u=class{constructor(){this.packet=[],this.setAccTitle=M,this.getAccTitle=j,this.setDiagramTitle=I,this.getDiagramTitle=X,this.getAccDescription=K,this.setAccDescription=H}getConfig(){const t=y({...B,...Y().packet});return t.showBits&&(t.paddingY+=10),t}getPacket(){return this.packet}pushWord(t){t.length>0&&this.packet.push(t)}clear(){U(),this.packet=[]}},m(u,"PacketDB"),u),_=1e4,C=m((t,e)=>{V(t,e);let r=-1,i=[],n=1;const{bitsPerRow:l}=e.getConfig();for(let{start:a,end:s,bits:c,label:d}of t.blocks){if(a!==void 0&&s!==void 0&&s<a)throw new Error(`Packet block ${a} - ${s} is invalid. End must be greater than start.`);if(a??(a=r+1),a!==r+1)throw new Error(`Packet block ${a} - ${s??a} is not contiguous. It should start from ${r+1}.`);if(c===0)throw new Error(`Packet block ${a} is invalid. Cannot have a zero bit field.`);for(s??(s=a+(c??1)-1),c??(c=s-a+1),r=s,x.debug(`Packet block ${a} - ${r} with label ${d}`);i.length<=l+1&&e.getPacket().length<_;){const[p,o]=$({start:a,end:s,bits:c,label:d},n,l);if(i.push(p),p.end+1===n*l&&(e.pushWord(i),i=[],n++),!o)break;({start:a,end:s,bits:c,label:d}=o)}}e.pushWord(i)},"populate"),$=m((t,e,r)=>{if(t.start===void 0)throw new Error("start should have been set during first phase");if(t.end===void 0)throw new Error("end should have been set during first phase");if(t.start>t.end)throw new Error(`Block start ${t.start} is greater than block end ${t.end}.`);if(t.end+1<=e*r)return[t,void 0];const i=e*r-1,n=e*r;return[{start:t.start,end:i,label:t.label,bits:i-t.start},{start:n,end:t.end,label:t.label,bits:t.end-n}]},"getNextFittingBlock"),w={parser:{yy:void 0},parse:m(async t=>{const e=await z("packet",t),r=w.parser?.yy;if(!(r instanceof b))throw new Error("parser.parser?.yy was not a PacketDB. This is due to a bug within Mermaid, please report this issue at https://github.com/mermaid-js/mermaid/issues.");x.debug(e),C(e,r)},"parse")},v=m((t,e,r,i)=>{const n=i.db,l=n.getConfig(),{rowHeight:a,paddingY:s,bitWidth:c,bitsPerRow:d}=l,p=n.getPacket(),o=n.getDiagramTitle(),g=a+s,h=g*(p.length+1)-(o?0:a),k=c*d+2,f=O(e);f.attr("viewBox",`0 0 ${k} ${h}`),G(f,h,k,l.useMaxWidth);for(const[P,T]of p.entries())S(f,T,P,l);f.append("text").text(o).attr("x",k/2).attr("y",h-g/2).attr("dominant-baseline","middle").attr("text-anchor","middle").attr("class","packetTitle")},"draw"),S=m((t,e,r,{rowHeight:i,paddingX:n,paddingY:l,bitWidth:a,bitsPerRow:s,showBits:c})=>{const d=t.append("g"),p=r*(i+l)+l;for(const o of e){const g=o.start%s*a+1,h=(o.end-o.start+1)*a-n;if(d.append("rect").attr("x",g).attr("y",p).attr("width",h).attr("height",i).attr("class","packetBlock"),d.append("text").attr("x",g+h/2).attr("y",p+i/2).attr("class","packetLabel").attr("dominant-baseline","middle").attr("text-anchor","middle").text(o.label),!c)continue;const k=o.end===o.start,f=p-2;d.append("text").attr("x",g+(k?h/2:0)).attr("y",f).attr("class","packetByte start").attr("dominant-baseline","auto").attr("text-anchor",k?"middle":"start").text(o.start),k||d.append("text").attr("x",g+h).attr("y",f).attr("class","packetByte end").attr("dominant-baseline","auto").attr("text-anchor","end").text(o.end)}},"drawWord"),A={draw:v},D={byteFontSize:"10px",startByteColor:"black",endByteColor:"black",labelColor:"black",labelFontSize:"12px",titleColor:"black",titleFontSize:"14px",blockStrokeColor:"black",blockStrokeWidth:"1",blockFillColor:"#efefef"},J={parser:w,get db(){return new b},renderer:A,styles:m(({packet:t}={})=>{const e=y(D,t);return`
	.packetByte {
		font-size: ${e.byteFontSize};
	}
	.packetByte.start {
		fill: ${e.startByteColor};
	}
	.packetByte.end {
		fill: ${e.endByteColor};
	}
	.packetLabel {
		fill: ${e.labelColor};
		font-size: ${e.labelFontSize};
	}
	.packetTitle {
		fill: ${e.titleColor};
		font-size: ${e.titleFontSize};
	}
	.packetBlock {
		stroke: ${e.blockStrokeColor};
		stroke-width: ${e.blockStrokeWidth};
		fill: ${e.blockFillColor};
	}
	`},"styles")}}));Z();export{J as diagram};
