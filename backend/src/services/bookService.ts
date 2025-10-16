import { 
  createBook, 
  findBookById, 
  listBooks, 
  updateBook, 
  deleteBook,
  type CreateBookInput,
  type UpdateBookInput 
} from '../models/book';

export async function createBookService(input: CreateBookInput) {
  return createBook(input);
}

export async function getBookByIdService(id: string) {
  return findBookById(id);
}

export async function listBooksService(params?: { 
  author?: string; 
  rating?: number; 
  search?: string; 
  uploadedById?: string;
  isAvailable?: boolean;
  page?: number;
  limit?: number;
}) {
  return listBooks(params);
}

export async function updateBookService(id: string, input: UpdateBookInput) {
  return updateBook(id, input);
}

export async function deleteBookService(id: string) {
  return deleteBook(id);
}
