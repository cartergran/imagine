import axios from 'axios';

/**
  - parameters for fetching a tile image
*/
type TileImgParams ={
  attempt: number;
  r: number;
  c: number;
};

/**
 * fetches the tile image data URL for a given attempt and position.
 */
export async function fetchTileImg({ attempt, r, c }: TileImgParams): Promise<string> {
  try {
    const res = await axios.get<string>('/puzzle/tile', {
      params: { attempt, r, c },
    });
    return res.data;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('fetchTileImg() Error!', errorMessage);
    return '';
  }
}
