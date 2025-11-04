import { useCloudinaryControllerUploadImage, CloudinaryControllerUploadImageBody } from '@/api';
import { parseError } from '@/utils/format-error';

export function useUploadImageMutation() {
  const mutation = useCloudinaryControllerUploadImage();

  return {
    ...mutation,
    uploadImage: (data: CloudinaryControllerUploadImageBody) =>
      mutation.mutateAsync({ data }),
    isUploading: mutation.isPending,
    error: parseError(mutation.error),
  };
}
