import{R as e}from"./index-Bc2G9s8g.js";import{c as V}from"./cn-DOIGBiOF.js";const q={"text-line":"w-full h-4 rounded-full",card:"w-full h-32 rounded-card",circle:"w-10 h-10 rounded-full"};function a({variant:i,width:_,height:T,className:R}){return e.createElement("div",{role:"status","aria-label":"Loading","aria-busy":"true",className:V("bg-border skeleton-pulse",q[i],_,T,R)})}try{a.displayName="Skeleton",a.__docgenInfo={description:"",displayName:"Skeleton",props:{variant:{defaultValue:null,description:"",name:"variant",required:!0,type:{name:"enum",value:[{value:'"text-line"'},{value:'"card"'},{value:'"circle"'}]}},width:{defaultValue:null,description:"",name:"width",required:!1,type:{name:"string"}},height:{defaultValue:null,description:"",name:"height",required:!1,type:{name:"string"}},className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string"}}}}}catch{}const A={title:"UI/Skeleton",component:a,parameters:{layout:"padded"}},t={args:{variant:"text-line"}},r={args:{variant:"card"}},n={args:{variant:"circle"}},l={render:()=>e.createElement("div",{className:"flex flex-col gap-6 p-4 w-80"},e.createElement("div",null,e.createElement("p",{className:"text-secondary mb-2"},"Text line"),e.createElement(a,{variant:"text-line"})),e.createElement("div",null,e.createElement("p",{className:"text-secondary mb-2"},"Card"),e.createElement(a,{variant:"card"})),e.createElement("div",null,e.createElement("p",{className:"text-secondary mb-2"},"Circle"),e.createElement(a,{variant:"circle"})))},c={parameters:{chromatic:{prefersReducedMotion:"reduce"}},render:()=>e.createElement("div",{className:"flex flex-col gap-6 p-4 w-80"},e.createElement("p",{className:"text-secondary text-caption"},"Pulse disabled with prefers-reduced-motion"),e.createElement("div",null,e.createElement("p",{className:"text-secondary mb-2"},"Text line (static)"),e.createElement(a,{variant:"text-line"})),e.createElement("div",null,e.createElement("p",{className:"text-secondary mb-2"},"Card (static)"),e.createElement(a,{variant:"card"})),e.createElement("div",null,e.createElement("p",{className:"text-secondary mb-2"},"Circle (static)"),e.createElement(a,{variant:"circle"})))},s={render:()=>e.createElement("div",{className:"flex flex-col gap-3 p-4 w-80"},e.createElement("p",{className:"text-secondary mb-2"},"Task card loading placeholder"),e.createElement("div",{className:"flex items-start gap-3"},e.createElement(a,{variant:"circle"}),e.createElement("div",{className:"flex flex-col gap-2 flex-1"},e.createElement(a,{variant:"text-line",height:"h-4"}),e.createElement(a,{variant:"text-line",width:"w-3/4",height:"h-3"}),e.createElement(a,{variant:"text-line",width:"w-1/2",height:"h-3"}))))};var d,o,m;t.parameters={...t.parameters,docs:{...(d=t.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    variant: 'text-line'
  }
}`,...(m=(o=t.parameters)==null?void 0:o.docs)==null?void 0:m.source}}};var p,u,v;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    variant: 'card'
  }
}`,...(v=(u=r.parameters)==null?void 0:u.docs)==null?void 0:v.source}}};var x,f,g;n.parameters={...n.parameters,docs:{...(x=n.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    variant: 'circle'
  }
}`,...(g=(f=n.parameters)==null?void 0:f.docs)==null?void 0:g.source}}};var h,E,N;l.parameters={...l.parameters,docs:{...(h=l.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-6 p-4 w-80">
      <div>
        <p className="text-secondary mb-2">Text line</p>
        <Skeleton variant="text-line" />
      </div>
      <div>
        <p className="text-secondary mb-2">Card</p>
        <Skeleton variant="card" />
      </div>
      <div>
        <p className="text-secondary mb-2">Circle</p>
        <Skeleton variant="circle" />
      </div>
    </div>
}`,...(N=(E=l.parameters)==null?void 0:E.docs)==null?void 0:N.source}}};var y,w,S;c.parameters={...c.parameters,docs:{...(y=c.parameters)==null?void 0:y.docs,source:{originalSource:`{
  parameters: {
    chromatic: {
      prefersReducedMotion: 'reduce'
    }
  },
  render: () => <div className="flex flex-col gap-6 p-4 w-80">
      <p className="text-secondary text-caption">
        Pulse disabled with prefers-reduced-motion
      </p>
      <div>
        <p className="text-secondary mb-2">Text line (static)</p>
        <Skeleton variant="text-line" />
      </div>
      <div>
        <p className="text-secondary mb-2">Card (static)</p>
        <Skeleton variant="card" />
      </div>
      <div>
        <p className="text-secondary mb-2">Circle (static)</p>
        <Skeleton variant="circle" />
      </div>
    </div>
}`,...(S=(w=c.parameters)==null?void 0:w.docs)==null?void 0:S.source}}};var b,k,C;s.parameters={...s.parameters,docs:{...(b=s.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-3 p-4 w-80">
      <p className="text-secondary mb-2">Task card loading placeholder</p>
      <div className="flex items-start gap-3">
        <Skeleton variant="circle" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton variant="text-line" height="h-4" />
          <Skeleton variant="text-line" width="w-3/4" height="h-3" />
          <Skeleton variant="text-line" width="w-1/2" height="h-3" />
        </div>
      </div>
    </div>
}`,...(C=(k=s.parameters)==null?void 0:k.docs)==null?void 0:C.source}}};const I=["TextLine","Card","Circle","AllVariants","ReducedMotion","ComposedExample"];export{l as AllVariants,r as Card,n as Circle,s as ComposedExample,c as ReducedMotion,t as TextLine,I as __namedExportsOrder,A as default};
