import { NextResponse } from "next/server";
import {
  createJob,
  deleteJob,
  getAllJobs,
  updateJob,
} from "@/utils/supabase/actions/jobs";

export async function GET() {
  try {
    const responseData = await getAllJobs();

    if (!responseData) {
      throw new Error("Erro ao buscar as vagas. Tente novamente mais tarde!");
    }

    return NextResponse.json({ results: responseData }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const pda_jobs_search_id = process.env.NEXT_PUBLIC_PDA_JOBS_SEARCH_ID;

    if (
      !data.title ||
      !data.company ||
      !data.description ||
      !data.link ||
      !data.details.locale[0] ||
      !data.details.locale[1] ||
      data.details.languages.length < 1 ||
      data.details.workplace_type.length !== 3 ||
      data.details.workplace_type[0].length < 1 ||
      data.details.workplace_type[1].length < 1 ||
      data.details.workplace_type[2].length < 1 ||
      !pda_jobs_search_id
    ) {
      throw new Error("Erro ao cadastrar a vaga. Verifique os dados.");
    }

    const responseData = await createJob({
      ...data,
      jobs_search_id: pda_jobs_search_id,
    });

    if (!responseData) {
      throw new Error("Erro ao cadastrar a vaga. Tente novamente mais tarde!");
    }

    return NextResponse.json({ new_job: responseData }, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error }, { status: 401 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();

    if (!data.updates || !data.jobId) {
      throw new Error("Erro ao editar a vaga. Verifique os dados.");
    }

    const responseData = await updateJob(data.jobId, data.updates);

    if (!responseData) {
      throw new Error("Erro ao editar a vaga. Tente novamente mais tarde!");
    }

    return NextResponse.json({ edited_job: responseData }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error }, { status: 401 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    console.log(id);

    if (!id) {
      throw new Error("Erro ao deletar a vaga. Verifique os dados.");
    }

    const responseData = await deleteJob(id);

    if (!responseData) {
      throw new Error("Erro ao deletar a. Tente novamente mais tarde!");
    }

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }
}
