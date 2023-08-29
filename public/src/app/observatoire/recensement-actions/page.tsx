import PageTitle from '@/components/common/PageTitle';
import Map from '@/components/observatoire/maps/Map';
import { Config } from '@/config';

export default function Page() {
  const title = 'test';
  const mapStyle = Config.get<string>('observatoire.mapStyle');

  return (
    <article id='content'>
      <PageTitle title={title} />
      <Map title={title} mapStyle={mapStyle} />
    </article>
  );
}
