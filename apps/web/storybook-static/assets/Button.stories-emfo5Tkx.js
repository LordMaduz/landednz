import{R as e}from"./index-Bc2G9s8g.js";import{c as ee}from"./cn-DOIGBiOF.js";const re={primary:"bg-primary text-text-inverse hover:bg-primary-hover",secondary:"bg-secondary text-text-primary hover:bg-secondary-hover",outline:"border border-primary bg-transparent text-primary hover:bg-primary-subtle",text:"bg-transparent text-primary hover:bg-primary-subtle",destructive:"bg-error text-text-inverse hover:bg-error-hover"},ae={sm:"px-3 py-2 text-secondary",md:"px-4 py-3 text-body",lg:"px-6 py-4 text-body"};function te(){return e.createElement("svg",{className:"animate-spin -ml-1 mr-2 h-4 w-4",xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","aria-hidden":"true"},e.createElement("circle",{className:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"4"}),e.createElement("path",{className:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"}))}function g({variant:r="primary",size:a="md",fullWidth:X=!1,loading:y=!1,disabled:v=!1,className:Y,children:Z,...$}){return e.createElement("button",{className:ee("inline-flex items-center justify-center font-medium rounded-button","transition-colors duration-150","focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2",re[r],ae[a],X&&"w-full",(v||y)&&"opacity-50 cursor-not-allowed",Y),disabled:v||y,...$},y&&e.createElement(te,null),Z)}try{g.displayName="Button",g.__docgenInfo={description:"",displayName:"Button",props:{variant:{defaultValue:{value:"primary"},description:"",name:"variant",required:!1,type:{name:"enum",value:[{value:'"text"'},{value:'"primary"'},{value:'"secondary"'},{value:'"outline"'},{value:'"destructive"'}]}},size:{defaultValue:{value:"md"},description:"",name:"size",required:!1,type:{name:"enum",value:[{value:'"sm"'},{value:'"md"'},{value:'"lg"'}]}},fullWidth:{defaultValue:{value:"false"},description:"",name:"fullWidth",required:!1,type:{name:"boolean"}},loading:{defaultValue:{value:"false"},description:"",name:"loading",required:!1,type:{name:"boolean"}}}}}catch{}const oe={title:"UI/Button",component:g,parameters:{layout:"centered"},argTypes:{variant:{control:"select",options:["primary","secondary","outline","text","destructive"]},size:{control:"select",options:["sm","md","lg"]}}},t={args:{variant:"primary",children:"Mark as done"}},s={args:{variant:"secondary",children:"Save progress"}},n={args:{variant:"outline",children:"Cancel"}},o={args:{variant:"text",children:"Delete account"}},c={args:{variant:"destructive",children:"Delete my account"}},i={args:{size:"sm",children:"Small"}},l={args:{size:"lg",children:"Build my plan — free"}},d={args:{loading:!0,children:"Saving..."}},m={args:{disabled:!0,children:"Disabled"}},u={args:{fullWidth:!0,children:"Full width CTA"},parameters:{layout:"padded"}},p={render:()=>e.createElement("div",{className:"flex flex-col gap-6 p-6 bg-bg"},["primary","secondary","outline","text","destructive"].map(r=>e.createElement("div",{key:r,className:"flex items-center gap-4"},["sm","md","lg"].map(a=>e.createElement(g,{key:a,variant:r,size:a},r," ",a))))),parameters:{layout:"fullscreen"}};var f,h,x;t.parameters={...t.parameters,docs:{...(f=t.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    variant: 'primary',
    children: 'Mark as done'
  }
}`,...(x=(h=t.parameters)==null?void 0:h.docs)==null?void 0:x.source}}};var b,S,z;s.parameters={...s.parameters,docs:{...(b=s.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    variant: 'secondary',
    children: 'Save progress'
  }
}`,...(z=(S=s.parameters)==null?void 0:S.docs)==null?void 0:z.source}}};var w,D,N;n.parameters={...n.parameters,docs:{...(w=n.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    variant: 'outline',
    children: 'Cancel'
  }
}`,...(N=(D=n.parameters)==null?void 0:D.docs)==null?void 0:N.source}}};var _,B,E;o.parameters={...o.parameters,docs:{...(_=o.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    variant: 'text',
    children: 'Delete account'
  }
}`,...(E=(B=o.parameters)==null?void 0:B.docs)==null?void 0:E.source}}};var k,C,V;c.parameters={...c.parameters,docs:{...(k=c.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    variant: 'destructive',
    children: 'Delete my account'
  }
}`,...(V=(C=c.parameters)==null?void 0:C.docs)==null?void 0:V.source}}};var W,T,q;i.parameters={...i.parameters,docs:{...(W=i.parameters)==null?void 0:W.docs,source:{originalSource:`{
  args: {
    size: 'sm',
    children: 'Small'
  }
}`,...(q=(T=i.parameters)==null?void 0:T.docs)==null?void 0:q.source}}};var A,F,L;l.parameters={...l.parameters,docs:{...(A=l.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    size: 'lg',
    children: 'Build my plan — free'
  }
}`,...(L=(F=l.parameters)==null?void 0:F.docs)==null?void 0:L.source}}};var M,O,I;d.parameters={...d.parameters,docs:{...(M=d.parameters)==null?void 0:M.docs,source:{originalSource:`{
  args: {
    loading: true,
    children: 'Saving...'
  }
}`,...(I=(O=d.parameters)==null?void 0:O.docs)==null?void 0:I.source}}};var P,R,j;m.parameters={...m.parameters,docs:{...(P=m.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    disabled: true,
    children: 'Disabled'
  }
}`,...(j=(R=m.parameters)==null?void 0:R.docs)==null?void 0:j.source}}};var U,G,H;u.parameters={...u.parameters,docs:{...(U=u.parameters)==null?void 0:U.docs,source:{originalSource:`{
  args: {
    fullWidth: true,
    children: 'Full width CTA'
  },
  parameters: {
    layout: 'padded'
  }
}`,...(H=(G=u.parameters)==null?void 0:G.docs)==null?void 0:H.source}}};var J,K,Q;p.parameters={...p.parameters,docs:{...(J=p.parameters)==null?void 0:J.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-6 p-6 bg-bg">
      {(['primary', 'secondary', 'outline', 'text', 'destructive'] as const).map(variant => <div key={variant} className="flex items-center gap-4">
          {(['sm', 'md', 'lg'] as const).map(size => <Button key={size} variant={variant} size={size}>
              {variant} {size}
            </Button>)}
        </div>)}
    </div>,
  parameters: {
    layout: 'fullscreen'
  }
}`,...(Q=(K=p.parameters)==null?void 0:K.docs)==null?void 0:Q.source}}};const ce=["Primary","Secondary","Outline","Text","Destructive","SizeSm","SizeLg","Loading","Disabled","FullWidth","AllVariants"];export{p as AllVariants,c as Destructive,m as Disabled,u as FullWidth,d as Loading,n as Outline,t as Primary,s as Secondary,l as SizeLg,i as SizeSm,o as Text,ce as __namedExportsOrder,oe as default};
