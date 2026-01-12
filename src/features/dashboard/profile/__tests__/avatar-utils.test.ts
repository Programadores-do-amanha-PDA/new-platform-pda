import { createImageFromUrl, getCroppedImageBlob, fileToBase64, blobToBase64 } from "../utils/avatar-utils";
import { Area } from "react-easy-crop";

describe("avatar-utils", () => {
    /**
     * Creates a mock HTMLImageElement with proper event handling and src property.
     * 
     * @returns A mocked HTMLImageElement instance
     */
    const createMockImage = (): HTMLImageElement => {
        const mockImage = new EventTarget() as unknown as HTMLImageElement;
        mockImage.addEventListener = jest.fn((event: string, callback: EventListener) => {
            if (event === "load") {
                setTimeout(callback as EventListener, 0);
            }
        });
        mockImage.setAttribute = jest.fn();
        Object.defineProperty(mockImage, "src", {
            writable: true,
            value: "",
        });
        return mockImage;
    };

    /**
     * Mock setup for canvas API
     */
    beforeEach(() => {
        HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
            drawImage: jest.fn(),
        })) as jest.Mock;

        HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
            callback(new Blob(["image data"], { type: "image/png" }));
        }) as jest.Mock;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("createImageFromUrl", () => {
        it("should successfully load image from valid URL", async () => {
            const url = "https://example.com/image.jpg";

            const mockImage = createMockImage();

            jest.spyOn(window, "Image").mockImplementation(() => mockImage);

            const result = await createImageFromUrl(url);
            expect(result).toBe(mockImage);
        });

        it("should set crossOrigin attribute to anonymous", async () => {
            const url = "https://example.com/image.jpg";
            const mockImage = createMockImage();
            const setAttributeSpy = jest.fn();
            mockImage.setAttribute = setAttributeSpy;

            jest.spyOn(window, "Image").mockImplementation(() => mockImage);

            await createImageFromUrl(url);
            expect(setAttributeSpy).toHaveBeenCalledWith("crossOrigin", "anonymous");
        });

        it("should set correct src attribute", async () => {
            const url = "https://example.com/image.jpg";

            const mockImage = createMockImage();

            jest.spyOn(window, "Image").mockImplementation(() => mockImage);

            await createImageFromUrl(url);
            expect(mockImage.src).toBe(url);
        });
    });

    describe("getCroppedImageBlob", () => {
        it("should return cropped image blob", async () => {
            const imageSrc = "https://example.com/image.jpg";
            const pixelCrop: Area = { x: 10, y: 10, width: 50, height: 50 };

            const mockImage = createMockImage();

            jest.spyOn(window, "Image").mockImplementation(() => mockImage);

            const result = await getCroppedImageBlob({ imageSrc, pixelCrop });
            expect(result).toBeInstanceOf(Blob);
        });

        it("should return null when canvas context is unavailable", async () => {
            const imageSrc = "https://example.com/image.jpg";
            const pixelCrop: Area = { x: 10, y: 10, width: 100, height: 100 };

            HTMLCanvasElement.prototype.getContext = jest.fn(() => null);

            const mockImage = createMockImage();

            jest.spyOn(window, "Image").mockImplementation(() => mockImage);

            const result = await getCroppedImageBlob({ imageSrc, pixelCrop });
            expect(result).toBeNull();
        });
    });

    describe("fileToBase64", () => {
        it("should convert File to base64 string", async () => {
            const file = new File(["test content"], "test.txt", { type: "text/plain" });
            const mockBase64 = "data:text/plain;base64,dGVzdCBjb250ZW50";

            const mockFileReader = {
                readAsDataURL: jest.fn(),
                onload: null as ((this: FileReader, event: ProgressEvent<FileReader>) => void) | null,
                onerror: null as ((this: FileReader, event: ProgressEvent<FileReader>) => void) | null,
                result: mockBase64,
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
            } as unknown as FileReader;

            jest.spyOn(window, "FileReader").mockImplementation(() => {
                setTimeout(() => {
                    if (mockFileReader.onload) {
                        mockFileReader.onload.call(mockFileReader, { target: mockFileReader } as ProgressEvent<FileReader>);
                    }
                }, 0);
                return mockFileReader;
            });

            const result = await fileToBase64(file);
            expect(result).toBe(mockBase64);
        });

        it("should call readAsDataURL with correct file", async () => {
            const file = new File(["content"], "image.png", { type: "image/png" });
            const readAsDataURLSpy = jest.fn();

            const mockReader = {
                readAsDataURL: readAsDataURLSpy,
                onload: null as ((this: FileReader, event: ProgressEvent<FileReader>) => void) | null,
                onerror: null as ((this: FileReader, event: ProgressEvent<FileReader>) => void) | null,
                result: "",
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
            } as unknown as FileReader;

            jest.spyOn(window, "FileReader").mockImplementation(() => {
                setTimeout(() => {
                    if (mockReader.onload) {
                        mockReader.onload.call(mockReader, { target: mockReader } as ProgressEvent<FileReader>);
                    }
                }, 0);
                return mockReader;
            });

            await fileToBase64(file);
            expect(readAsDataURLSpy).toHaveBeenCalledWith(file);
        });
    });

    describe("blobToBase64", () => {
        it("should convert Blob to base64 string", async () => {
            const blob = new Blob(["test content"], { type: "image/png" });
            const mockBase64 = "data:image/png;base64,dGVzdCBjb250ZW50";

            const mockReader = {
                readAsDataURL: jest.fn(),
                onload: null as ((this: FileReader, event: ProgressEvent<FileReader>) => void) | null,
                onerror: null as ((this: FileReader, event: ProgressEvent<FileReader>) => void) | null,
                result: mockBase64,
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
            } as unknown as FileReader;

            jest.spyOn(window, "FileReader").mockImplementation(() => {
                setTimeout(() => {
                    if (mockReader.onload) {
                        mockReader.onload.call(mockReader, { target: mockReader } as ProgressEvent<FileReader>);
                    }
                }, 0);
                return mockReader;
            });

            const result = await blobToBase64(blob);
            expect(result).toBe(mockBase64);
        });

        it("should call readAsDataURL with correct blob", async () => {
            const blob = new Blob(["data"], { type: "application/json" });
            const readAsDataURLSpy = jest.fn();

            const mockReader = {
                readAsDataURL: readAsDataURLSpy,
                onload: null as ((this: FileReader, event: ProgressEvent<FileReader>) => void) | null,
                onerror: null as ((this: FileReader, event: ProgressEvent<FileReader>) => void) | null,
                result: "",
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
            } as unknown as FileReader;

            jest.spyOn(window, "FileReader").mockImplementation(() => {
                setTimeout(() => {
                    if (mockReader.onload) {
                        mockReader.onload.call(mockReader, { target: mockReader } as ProgressEvent<FileReader>);
                    }
                }, 0);
                return mockReader;
            });

            await blobToBase64(blob);
            expect(readAsDataURLSpy).toHaveBeenCalledWith(blob);
        });

        it("should handle empty blob correctly", async () => {
            const emptyBlob = new Blob([], { type: "image/png" });
            const mockBase64 = "data:image/png;base64,";

            const mockReader = {
                readAsDataURL: jest.fn(),
                onload: null as ((this: FileReader, event: ProgressEvent<FileReader>) => void) | null,
                onerror: null as ((this: FileReader, event: ProgressEvent<FileReader>) => void) | null,
                result: mockBase64,
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
            } as unknown as FileReader;

            jest.spyOn(window, "FileReader").mockImplementation(() => {
                setTimeout(() => {
                    if (mockReader.onload) {
                        mockReader.onload.call(mockReader, { target: mockReader } as ProgressEvent<FileReader>);
                    }
                }, 0);
                return mockReader;
            });

            const result = await blobToBase64(emptyBlob);
            expect(result).toBe(mockBase64);
        });
    });
});
