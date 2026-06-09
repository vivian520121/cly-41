export interface EasingOption {
  value: string;
  label: string;
  smilValue: string;
}

export const easingOptions: EasingOption[] = [
  { value: 'linear', label: '线性 (Linear)', smilValue: '0;1' },
  { value: 'ease', label: '缓动 (Ease)', smilValue: '0,0.25,0.1,1' },
  { value: 'ease-in', label: '缓入 (Ease In)', smilValue: '0.42,0,1,1' },
  { value: 'ease-out', label: '缓出 (Ease Out)', smilValue: '0,0,0.58,1' },
  { value: 'ease-in-out', label: '缓入缓出 (Ease In Out)', smilValue: '0.42,0,0.58,1' },
  { value: 'elastic', label: '弹性 (Elastic)', smilValue: '0.68,-0.55,0.265,1.55' },
  { value: 'bounce', label: '弹跳 (Bounce)', smilValue: '0.6,0.04,0.98,0.335' },
  { value: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)', label: '回弹 (Back)', smilValue: '0.68,-0.6,0.32,1.6' },
];

export const getEasingSMIL = (easing: string): string => {
  const option = easingOptions.find(o => o.value === easing);
  return option ? option.smilValue : '0;1';
};

export const getLoopValue = (loopCount: number): string => {
  return loopCount === 0 ? 'indefinite' : loopCount.toString();
};
