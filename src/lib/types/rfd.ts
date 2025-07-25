export type Endorser = {
    userId: string;
    name: string | null;
    picture: string | null;
    createdAt: string;
};

export type RFD = {
    id: string;
    rfdNumber: number;
    title: string;
    summary: string | null;
    status: string;
    authorId: string;
    authorName: string | null;
    authorEmail: string | null;
    googleDocUrl: string;
    tags: string | null;
    createdAt: string;
    updatedAt: string;
    endorsementCount: number;
    userHasEndorsed: boolean;
    endorsers: Endorser[];
};