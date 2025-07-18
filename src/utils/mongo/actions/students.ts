import { ObjectId } from "mongodb";
import { mongoClient } from "../config";

const dbName = "whats-bot";
const collectionName = "PdA";

type StudentsType = {
  _id: ObjectId;
  id: string;
  ies: string;
  languages: string[];
  isOnSite: boolean;
  course: string;
  phone: string;
  residenceCity: string;
  linkedIn: string;
  name: string;
  email: string;
  updatedAt: Date;
  interestArea: string;
  residenceState: string;
  studying: string;
  formationForecast: string;
  gitHub: string;
  class: string;
};

export const getAllStudents = async () => {
  try {
    await mongoClient.connect();
    const database = mongoClient.db(dbName);
    const collection = database.collection(collectionName);

    const results = await collection.find({}).toArray();

    return results;
  } catch (error) {
    console.error("Erro ao buscar documentos:", error);
    return false;
  } finally {
    await mongoClient.close();
  }
};

export const insertMultiplesStudents = async (students: StudentsType[]) => {
  try {
    if (!students) throw new Error("Array de documentos vazio!");

    await mongoClient.connect();
    const database = mongoClient.db(dbName);
    const collection = database.collection(collectionName);

    const result = await collection.insertMany(students);

    return result;
  } catch (error) {
    console.error("Erro ao inserir documentos:", error);
    return false;
  } finally {
    await mongoClient.close();
  }
};

export const updateOneStudent = async (
  studentId: string,
  updates: Partial<StudentsType>
) => {
  try {
    if (!studentId || studentId.length === 0) {
      throw new Error("Array de IDs vazio ou inválido!");
    }

    if (!updates || typeof updates !== "object") {
      throw new Error("update data is not a object or is empty!");
    }

    const objectId = () => {
      if (typeof studentId !== "string" || !ObjectId.isValid(studentId)) {
        throw new Error(`ID inválido: ${studentId}`);
      }
      return new ObjectId(studentId);
    };

    await mongoClient.connect();
    const database = mongoClient.db(dbName);
    const collection = database.collection(collectionName);

    const results = await collection.updateOne(
      { _id: objectId() },
      { $set: updates }
    );

    return results;
  } catch (error) {
    console.error("Error on update student:", error);
    return false;
  } finally {
    await mongoClient.close();
  }
};

export const deleteMultipleStudents = async (studentsIds: string[]) => {
  try {
    if (
      !studentsIds ||
      !Array.isArray(studentsIds) ||
      studentsIds.length === 0
    ) {
      throw new Error("students ids is not an array or is empty");
    }

    const objectIds = studentsIds.map((id) => {
      if (typeof id !== "string" || !ObjectId.isValid(id)) {
        throw new Error(`invalid id: ${id}`);
      }
      return new ObjectId(id);
    });

    await mongoClient.connect();
    const database = mongoClient.db(dbName);
    const collection = database.collection(collectionName);

    await collection.deleteMany({ _id: { $in: objectIds } });

    return true;
  } catch (error) {
    console.error("Erro ao deletar documentos:", error);
    return false;
  } finally {
    await mongoClient.close();
  }
};
