import{R as e}from"./index-Bc2G9s8g.js";import{c as U}from"./cn-DOIGBiOF.js";const q={default:"bg-bg-card border-border shadow-card",hover:"bg-bg-card border-border-hover shadow-card-hover",selected:"bg-primary-light border-primary shadow-card",error:"bg-error-light border-error/30 shadow-card"},D={compact:"p-3",default:"p-6",spacious:"p-8"};function a({state:t="default",padding:T="default",className:A,children:V,...I}){return e.createElement("div",{className:U("rounded-card border transition-all duration-150",q[t],D[T],A),...I},V)}try{a.displayName="Card",a.__docgenInfo={description:"",displayName:"Card",props:{state:{defaultValue:{value:"default"},description:"",name:"state",required:!1,type:{name:"enum",value:[{value:'"default"'},{value:'"hover"'},{value:'"selected"'},{value:'"error"'}]}},padding:{defaultValue:{value:"default"},description:"",name:"padding",required:!1,type:{name:"enum",value:[{value:'"default"'},{value:'"compact"'},{value:'"spacious"'}]}}}}}catch{}const R={title:"UI/Card",component:a,parameters:{layout:"padded"}},l=e.createElement("div",null,e.createElement("h3",{className:"text-h3 text-text-primary mb-1"},"Card Title"),e.createElement("p",{className:"text-body text-text-secondary"},"Card body text with some supporting content to show the real UI/UX presentation.")),r={args:{children:l}},s={args:{state:"hover",children:l}},c={args:{state:"selected",children:l}},d={args:{state:"error",children:l}},o={render:()=>e.createElement("div",{className:"flex flex-col gap-4 max-w-sm"},["default","hover","selected","error"].map(t=>e.createElement(a,{key:t,state:t},e.createElement("p",{className:"text-caption text-text-tertiary uppercase tracking-wide mb-1"},t," state"),e.createElement("h3",{className:"text-h3 text-text-primary mb-1"},"Card Title"),e.createElement("p",{className:"text-body text-text-secondary"},"Sample content showing ",t," styling."))))},n={render:()=>e.createElement("div",{className:"flex flex-col gap-4 max-w-sm"},["compact","default","spacious"].map(t=>e.createElement(a,{key:t,padding:t},e.createElement("p",{className:"text-caption text-text-tertiary uppercase tracking-wide mb-1"},t," padding"),e.createElement("h3",{className:"text-h3 text-text-primary mb-1"},"Card Title"),e.createElement("p",{className:"text-body text-text-secondary"},"Content with ",t," padding variant."))))};var m,p,i;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    children: CardContent
  }
}`,...(i=(p=r.parameters)==null?void 0:p.docs)==null?void 0:i.source}}};var u,x,g;s.parameters={...s.parameters,docs:{...(u=s.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    state: 'hover',
    children: CardContent
  }
}`,...(g=(x=s.parameters)==null?void 0:x.docs)==null?void 0:g.source}}};var h,y,f;c.parameters={...c.parameters,docs:{...(h=c.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    state: 'selected',
    children: CardContent
  }
}`,...(f=(y=c.parameters)==null?void 0:y.docs)==null?void 0:f.source}}};var v,b,C;d.parameters={...d.parameters,docs:{...(v=d.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    state: 'error',
    children: CardContent
  }
}`,...(C=(b=d.parameters)==null?void 0:b.docs)==null?void 0:C.source}}};var N,w,E;o.parameters={...o.parameters,docs:{...(N=o.parameters)==null?void 0:N.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-4 max-w-sm">
      {(['default', 'hover', 'selected', 'error'] as const).map(state => <Card key={state} state={state}>
          <p className="text-caption text-text-tertiary uppercase tracking-wide mb-1">{state} state</p>
          <h3 className="text-h3 text-text-primary mb-1">Card Title</h3>
          <p className="text-body text-text-secondary">Sample content showing {state} styling.</p>
        </Card>)}
    </div>
}`,...(E=(w=o.parameters)==null?void 0:w.docs)==null?void 0:E.source}}};var S,_,k;n.parameters={...n.parameters,docs:{...(S=n.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-4 max-w-sm">
      {(['compact', 'default', 'spacious'] as const).map(padding => <Card key={padding} padding={padding}>
          <p className="text-caption text-text-tertiary uppercase tracking-wide mb-1">{padding} padding</p>
          <h3 className="text-h3 text-text-primary mb-1">Card Title</h3>
          <p className="text-body text-text-secondary">Content with {padding} padding variant.</p>
        </Card>)}
    </div>
}`,...(k=(_=n.parameters)==null?void 0:_.docs)==null?void 0:k.source}}};const O=["Default","Hover","Selected","Error","AllStates","AllPaddingVariants"];export{n as AllPaddingVariants,o as AllStates,r as Default,d as Error,s as Hover,c as Selected,O as __namedExportsOrder,R as default};
