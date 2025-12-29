export function salesNarrative(fuso, isuzu, payloadData) {
  return [
    {
      title: "Payload Advantage",
      message: `Fuso carries ${fuso.extraPayloadTons} tons more per trip,
resulting in ${payloadData.extraAnnualTons.toLocaleString()} additional tons moved annually.`
    },
    {
      title: "Operating Efficiency",
      message: "Despite similar fuel consumption, Fuso achieves a lower cost per ton-km due to higher payload."
    },
    {
      title: "Climbing Performance",
      message: "On gradients above 6%, the competitor downshifts earlier, reducing average speed and increasing fuel burn."
    },
    {
      title: "Business Impact",
      message: "Choosing the lower payload truck results in measurable lost revenue every year."
    }
  ];
}
