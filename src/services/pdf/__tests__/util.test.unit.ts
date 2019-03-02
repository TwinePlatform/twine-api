import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import * as _ from '../util';


describe('PDF Utilities', () => {
  describe('isDataUrl', () => {
    test('is', () => {
      expect(_.isDataUrl('data:')).toBe(true);
      expect(_.isDataUrl('data:jfeorgowienfewoenf')).toBe(true);
    });

    test('isn\'t', () => {
      expect(_.isDataUrl('')).toBe(false);
      expect(_.isDataUrl('_')).toBe(false);
      expect(_.isDataUrl('data')).toBe(false);
    });
  });

  describe('toDataUrl', () => {
    let mock: MockAdapter;

    beforeAll(() => {
      mock = new MockAdapter(axios);
    });

    test('fetching jpeg', async () => {
      const url1 = 'https://example.com/fake.jpg';
      const url2 = 'https://example.com/fake.jpeg';
      const payload = 'imgresponse';

      mock
        .onGet(url1.replace('jpg', 'png')).reply(200, payload)
        .onGet(url2.replace('jpeg', 'png')).reply(200, payload);

      const res1 = await _.toDataUrl(url1);
      const res2 = await _.toDataUrl(url2);

      expect(res1).toBe(`data:image/png;base64,${Buffer.from(payload).toString('base64')}`);
      expect(res2).toBe(`data:image/png;base64,${Buffer.from(payload).toString('base64')}`);
    });

    test('fetching png', async () => {
      const url1 = 'https://example.com/fake.png';
      const payload = 'imgresponse';

      mock.onGet(url1).reply(200, payload);

      const res1 = await _.toDataUrl(url1);

      expect(res1).toBe(`data:image/png;base64,${Buffer.from(payload).toString('base64')}`);
    });

    test('network error', async () => {
      expect.assertions(1);

      const url1 = 'https://example.com/fake.png';

      mock.onGet(url1).reply(404, 'imgresponse');

      try {
        await _.toDataUrl(url1);
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });
  });
});
