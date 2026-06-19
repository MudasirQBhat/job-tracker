const Skeleton = ({ width = '100%', height = 16, radius = 8, style }) => (
  <span
    className="skeleton"
    style={{ display: 'block', width, height, borderRadius: radius, ...style }}
  />
);

export default Skeleton;
