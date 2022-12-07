const upload = require('../upload');

describe('buildpack is not properly configured', () => {
    it('build will fail with error', async () => {
        const mockExit = jest.spyOn(process, 'exit')
            .mockImplementation((number) => { throw new Error('process.exit: ' + number); });
        expect(() => {
            upload();
        }).toThrow();
        expect(mockExit).toHaveBeenCalledWith(1);
        mockExit.mockRestore();
      });
})
