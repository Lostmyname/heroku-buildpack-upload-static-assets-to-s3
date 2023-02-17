const upload = require('../processStaticFiles');
var fs = require('fs');

describe('buildpack is not properly configured', () => {
    it('build will fail with error', async () => {
        process.env.ENV_DIR = '/';
        const mockExit = jest.spyOn(process, 'exit')
            .mockImplementation((number) => { throw new Error('process.exit: ' + number); });
        expect(() => {
            upload();
        }).toThrow();
        expect(mockExit).toHaveBeenCalledWith(1);
        mockExit.mockRestore();
      });
})

describe('review app build', () => {
    it("exits without error", () => {
        process.env.ENV_DIR = '/';
        jest.spyOn(fs, 'readdirSync').mockReturnValue(["IS_REVIEW_APP"])
        const mockExit = jest.spyOn(process, 'exit')
                .mockImplementation((number) => { throw new Error('process.exit: ' + number); });
        expect(() => {
            upload();
        }).toThrow();
        expect(mockExit).toHaveBeenCalledWith(0);
        mockExit.mockRestore();
    })
})
